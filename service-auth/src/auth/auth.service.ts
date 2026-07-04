import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import * as bcrypt from "bcryptjs";
import { randomUUID, createHash } from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, correlationId: string = "system") {
    const email = dto.email.toLowerCase().trim();

    // Check unique email
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    // Hash password (12 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user, profile, refresh session and outbox event in transaction
    const { user, refreshToken } = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: dto.role,
        },
      });

      await tx.profile.create({
        data: {
          userId: u.id,
          name: dto.name,
          phone: dto.phone || null,
        },
      });

      const rt = randomUUID();
      const rth = this.hashToken(rt);
      const expAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await tx.refreshSession.create({
        data: {
          userId: u.id,
          tokenHash: rth,
          expiresAt: expAt,
        },
      });

      // Create outbox event (optional for analytics, but highly recommended)
      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "user.registered.v1",
          version: 1,
          occurredAt: new Date(),
          correlationId,
          producer: "service-auth",
          payload: {
            userId: u.id,
            email: u.email,
            role: u.role,
            name: dto.name,
          },
          status: "PENDING",
        },
      });

      return { user: u, refreshToken: rt };
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const { passwordHash: _, ...result } = user;
    return {
      accessToken,
      refreshToken,
      user: result,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate tokens
    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = randomUUID();
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const session = await this.prisma.refreshSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user || !session.user.isActive || session.user.deletedAt) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    // Generate new tokens
    const newAccessToken = this.jwtService.sign({
      sub: session.user.id,
      role: session.user.role,
      email: session.user.email,
    });

    const newRefreshToken = randomUUID();
    const newTokenHash = this.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.$transaction(async (tx) => {
      // Revoke old session
      await tx.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      // Create new session
      await tx.refreshSession.create({
        data: {
          userId: session.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshSession.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } else if (userId) {
      await this.prisma.refreshSession.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException("User not found or inactive");
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async deleteAccount(userId: string, correlationId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("User not found");
    }

    const eventId = randomUUID();

    await this.prisma.$transaction(async (tx) => {
      // Soft-delete user
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // Revoke all active sessions
      await tx.refreshSession.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Create outbox event
      await tx.outboxEvent.create({
        data: {
          id: eventId,
          eventName: "user.account.deleted.v1",
          version: 1,
          occurredAt: new Date(),
          correlationId,
          producer: "service-auth",
          payload: {
            userId: user.id,
            email: user.email,
            role: user.role,
            deletedAt: new Date().toISOString(),
          },
          status: "PENDING",
        },
      });
    });

    return { success: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException("User not found or inactive");
    }

    const currentPasswordMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentPasswordMatch) {
      throw new UnauthorizedException("Invalid current password");
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new ConflictException("New password cannot be the same as the current password");
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: "Password updated successfully" };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

import { Controller, Post, Get, Delete, Body, UseGuards, Inject, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { SuccessResponse } from "../common/http/response.interface";
import { CORRELATION_ID_KEY } from "../common/correlation/correlation.middleware";
import { REQUEST } from "@nestjs/core";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new tourist or worker user" })
  async register(@Body() dto: RegisterDto): Promise<SuccessResponse<any>> {
    const result = await this.authService.register(dto);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validate credentials and emit JWT access + refresh tokens" })
  async login(@Body() dto: LoginDto): Promise<SuccessResponse<any>> {
    const result = await this.authService.login(dto);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Renew access token using refresh token" })
  async refresh(@Body() dto: RefreshDto): Promise<SuccessResponse<any>> {
    const result = await this.authService.refresh(dto.refreshToken);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout user and revoke refresh session" })
  async logout(
    @Body() dto: LogoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SuccessResponse<any>> {
    const result = await this.authService.logout(dto.refreshToken, user.sub);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile and identity details" })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<SuccessResponse<any>> {
    const result = await this.authService.getMe(user.sub);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Delete("account")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft-delete the authenticated user's account" })
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const correlationId = this.request[CORRELATION_ID_KEY] || "system";
    await this.authService.deleteAccount(user.sub, correlationId);
  }
}

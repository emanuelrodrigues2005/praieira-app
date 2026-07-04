import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface AuthenticatedUser {
  sub: string;
  role: "TOURIST" | "WORKER" | "CURATOR" | "ADMIN";
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-jwt-secret-change-in-production",
    });
  }

  async validate(payload: {
    sub: string;
    role: string;
    email: string;
  }): Promise<AuthenticatedUser> {
    return {
      sub: payload.sub,
      role: payload.role as AuthenticatedUser["role"],
      email: payload.email,
    };
  }
}

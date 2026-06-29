import * as jwt from "@nestjs/jwt";

const JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";

export interface TestUser {
  sub: string;
  role: "TOURIST" | "WORKER" | "CURATOR" | "ADMIN";
  email: string;
}

export function generateToken(user: TestUser): string {
  const jwtService = new jwt.JwtService({
    secret: JWT_SECRET,
    signOptions: { algorithm: "HS256" },
  });
  return jwtService.sign(user);
}

export const TOURIST_A: TestUser = {
  sub: "00000000-0000-4000-8000-000000000001",
  role: "TOURIST",
  email: "tourist-a@test.com",
};

export const TOURIST_B: TestUser = {
  sub: "00000000-0000-4000-8000-000000000002",
  role: "TOURIST",
  email: "tourist-b@test.com",
};

export const WORKER: TestUser = {
  sub: "00000000-0000-4000-8000-000000000003",
  role: "WORKER",
  email: "worker@test.com",
};

export const CURATOR: TestUser = {
  sub: "00000000-0000-4000-8000-000000000004",
  role: "CURATOR",
  email: "curator@test.com",
};

export const WORKER_PROFILE_ID = "10000000-0000-4000-8000-000000000001";

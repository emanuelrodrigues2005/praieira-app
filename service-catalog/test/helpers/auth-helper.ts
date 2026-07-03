import * as jwt from "jsonwebtoken";

export interface TestUser {
  sub: string;
  role: "TOURIST" | "WORKER" | "CURATOR" | "ADMIN";
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret-not-for-production";
const JWT_ALGORITHM = (process.env.JWT_ALGORITHM as "HS256") ?? "HS256";

export function generateToken(user: Partial<TestUser> = {}): string {
  const payload = {
    sub: user.sub ?? "00000000-0000-4000-8000-000000000001",
    role: user.role ?? "TOURIST",
    email: user.email ?? "test@example.com",
  };
  return jwt.sign(payload, JWT_SECRET, { algorithm: JWT_ALGORITHM });
}

export function authHeader(user?: Partial<TestUser>): { Authorization: string } {
  return { Authorization: `Bearer ${generateToken(user)}` };
}

export const testUsers = {
  tourist: { sub: "tourist-uuid", role: "TOURIST" as const, email: "tourist@test.com" },
  worker: { sub: "worker-uuid", role: "WORKER" as const, email: "worker@test.com" },
  curator: { sub: "curator-uuid", role: "CURATOR" as const, email: "curator@test.com" },
  admin: { sub: "admin-uuid", role: "ADMIN" as const, email: "admin@test.com" },
};

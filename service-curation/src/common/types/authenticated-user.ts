export interface AuthenticatedUser {
  sub: string;
  role: "TOURIST" | "WORKER" | "CURATOR" | "ADMIN";
  email: string;
}

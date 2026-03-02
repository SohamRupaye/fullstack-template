import { UserRole } from "database";

export interface AuthUser {
  id: string;
  role: UserRole;
  username?: string;
}

export interface AuthStrategy {
  /**
   * Verifies the provided token and returns an AuthUser object if valid.
   * Throws an error or returns null if the token is completely invalid.
   */
  verifyToken(token: string): Promise<AuthUser | null>;
}

import { AuthStrategy, AuthUser } from "../AuthStrategy";
import { verifyJWT } from "../../../utils/jwt.util";
import { UserRole } from "database";

export class LocalJWTStrategy implements AuthStrategy {
  public async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = verifyJWT(token);

      if (decoded && decoded.id) {
        return {
          id: decoded.id,
          username: decoded.email,
          role: decoded.role as UserRole,
        };
      }
      return null;
    } catch (error) {
      console.log("LocalJWTStrategy: Invalid token", error);
      return null;
    }
  }
}

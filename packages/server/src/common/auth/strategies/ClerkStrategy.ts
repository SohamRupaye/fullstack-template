import { AuthStrategy, AuthUser } from "../AuthStrategy";
import { UserRole } from "database";

export class ClerkStrategy implements AuthStrategy {
  public async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // 1. Typically you would import clerkClient from "@clerk/clerk-sdk-node"
      // 2. Await the verification
      // const decoded = await clerkClient.verifyToken(token);

      // 3. And return your internal formatted User object

      /* Example implementation
      if (decoded && decoded.sub) {
        return {
          id: decoded.sub,
          // Extract roles/metadata configured in your external provider
          role: (decoded.metadata?.role as UserRole) || UserRole.USER,
        };
      }
      */

      throw new Error(
        "ClerkStrategy verifyToken is not implemented in this starter template yet. Follow the commented example above."
      );
    } catch (error) {
      console.log("ClerkStrategy: Invalid token", error);
      return null;
    }
  }
}

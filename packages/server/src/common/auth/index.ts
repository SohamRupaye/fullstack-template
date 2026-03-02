import { AuthStrategy } from "./AuthStrategy";
import { ClerkStrategy } from "./strategies/ClerkStrategy";
import { LocalJWTStrategy } from "./strategies/LocalJWTStrategy";

// ---------------------------------------------------------------------------
// AUTH STRATEGY CONFIGURATION
// ---------------------------------------------------------------------------
// To switch your entire application's authentication method, simply change
// the exported `authStrategy` instance below.
//
// Examples:
// export const authStrategy: AuthStrategy = new LocalJWTStrategy();
// export const authStrategy: AuthStrategy = new ClerkStrategy();
// ---------------------------------------------------------------------------

export const authStrategy: AuthStrategy = new LocalJWTStrategy();

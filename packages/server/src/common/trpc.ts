import { initTRPC, inferAsyncReturnType, TRPCError } from "@trpc/server";
import loggingTRPCMiddleware from "./middleware/logging.trpc.middleware";
import { verifyJWT } from "../utils/jwt.util";
import { transformer } from "shared/transformer";
import { UserRole } from "database";
import { RUNTIME_VARIABLES } from "./runtime-variable";

// ---------------------------------------------------------------------------
// AUTH STRATEGY — pick one and implement accordingly
// ---------------------------------------------------------------------------
// STRATEGY 1: Self-contained JWT (RSA key pair)
//   - Generate an RSA key pair, store as RSA_PAIR env var (see .env.dev)
//   - signJWT() / verifyJWT() in jwt.util.ts handle everything
//   - The context below verifies the Bearer token from Authorization header
//
// STRATEGY 2: Shared RSA microservice
//   - Your auth microservice signs JWTs with its private key
//   - Store ONLY the public key in this server's RSA_PAIR env var
//   - verifyJWT() already supports this — no code change needed
//
// STRATEGY 3: Clerk / NextAuth / third-party
//   - Replace the `if (token)` block below with your provider's verify call
//   - e.g. for Clerk: const payload = await clerkClient.verifyToken(token)
//   - Remove RSA_PAIR from .env.dev entirely
// ---------------------------------------------------------------------------

export const createContext = (opts?: any) => {
  const token = opts?.req?.headers?.authorization?.split(" ")[1] ?? null;
  const adminSecret = opts?.req?.headers?.["x-admin-secret-key"] ?? null;

  let user: { id: string; role: UserRole; username: string } | null = null;

  if (token && RUNTIME_VARIABLES.RSA_PAIR) {
    try {
      const decoded = verifyJWT(token);
      if (decoded && decoded.id) {
        user = {
          id: decoded.id,
          username: decoded.email,
          role: decoded.role as UserRole,
        };
      }
    } catch (error) {
      console.log("createContext: Invalid token", error);
    }
  }

  return { token, user, adminSecret };
};

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape }) {
    if (process.env.NODE_ENV === "production" && shape.data) {
      const { stack, ...safeData } = shape.data;
      return { ...shape, data: safeData };
    }
    return shape;
  },
});

// Middleware: require authenticated user
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const router = t.router;

/** Open to everyone — no auth required */
export const publicProcedure = t.procedure.use(
  t.middleware(loggingTRPCMiddleware)
);

/** Requires a valid JWT. Throws UNAUTHORIZED if missing/invalid. */
export const protectedProcedure = t.procedure
  .use(t.middleware(loggingTRPCMiddleware))
  .use(isAuthed);

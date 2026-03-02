import { initTRPC, inferAsyncReturnType, TRPCError } from "@trpc/server";
import loggingTRPCMiddleware from "./middleware/logging.trpc.middleware";
import { authStrategy } from "./auth";
import { transformer } from "shared/transformer";
import { UserRole } from "database";
import { RUNTIME_VARIABLES } from "./runtime-variable";

// ---------------------------------------------------------------------------
// AUTH STRATEGY CONFIGURATION
// ---------------------------------------------------------------------------
// Check `src/common/auth/index.ts` to switch between Local JWTs, Clerk,
// or other external providers cleanly.
// ---------------------------------------------------------------------------

export const createContext = async (opts?: any) => {
  const token = opts?.req?.headers?.authorization?.split(" ")[1] ?? null;
  const adminSecret = opts?.req?.headers?.["x-admin-secret-key"] ?? null;

  let user: { id: string; role: UserRole; username?: string } | null = null;

  if (token) {
    try {
      const authUser = await authStrategy.verifyToken(token);
      if (authUser) {
        user = authUser;
      }
    } catch (error) {
      console.log("createContext: Token Verification Failed", error);
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

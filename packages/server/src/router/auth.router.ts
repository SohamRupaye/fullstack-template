import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../common/trpc";
import { prisma } from "../db";

/**
 * Auth Router — wire your auth strategy here.
 *
 * publicProcedure  → no token required
 * protectedProcedure → throws UNAUTHORIZED if no valid JWT in Authorization header
 *
 * Example: Replace the login mutation body with your real auth logic
 * (bcrypt compare + signJWT, Clerk session verify, etc.)
 */
export const authRouter = router({
  /** Example public route — replace with real login logic */
  login: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login",
        tags: ["auth"],
        summary: "Login user",
      },
    })
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .output(z.any())
    .mutation(async ({ input: _input }) => {
      // TODO: implement login
      // 1. Find user by email
      // 2. Compare password with bcrypt
      // 3. Sign JWT: signJWT({ id: user.id, email: user.email, role: user.role })
      // 4. Return { token, user }
      throw new Error("Not implemented — add your login logic here");
    }),

  /** Example protected route — only reachable with a valid JWT */
  me: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/me",
        tags: ["auth"],
        summary: "Get current user",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.any())
    .query(({ ctx }) => {
      return ctx.user;
    }),

  // Example
  getUser: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/user",
        tags: ["auth"],
        summary: "Get user by email",
      },
    })
    .input(z.object({ email: z.string().email() }))
    .output(z.any())
    .query(async ({ input: { email } }) => {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error("User not found");
      }
      return { name: user.name, role: user.role };
    }),
});

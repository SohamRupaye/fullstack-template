import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { publicProcedure, router } from "../common/trpc";
import { createContext } from "../common/trpc";
import { authRouter } from "./auth.router";

// ---------------------------------------------------------------------------
// tRPC Router — add your feature routers here
// ---------------------------------------------------------------------------
export const portalTrpcRouter = router({
  /** Health check — useful for uptime monitors and load balancers */
  health: publicProcedure.query(() => ({
    status: "ok",
    time: new Date(),
  })),

  // Feature routers
  auth: authRouter,
  // user: userRouter,
  // product: productRouter,
});

export type AppRouter = typeof portalTrpcRouter;

// ---------------------------------------------------------------------------
// Express adapter
// ---------------------------------------------------------------------------
const portalRouter: express.Router = express.Router();

portalRouter.use(
  "/trpc",
  createExpressMiddleware({
    router: portalTrpcRouter,
    createContext,
  })
);

export default portalRouter;

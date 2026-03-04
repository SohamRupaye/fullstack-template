import { generateOpenApiDocument } from "trpc-openapi";
import { portalTrpcRouter } from "../router/router";
import { env } from "./env";

export const openApiDocument = generateOpenApiDocument(portalTrpcRouter, {
  title: "Fullstack API",
  description: "Generated OpenAPI Documentation for the tRPC router",
  version: "1.0.0",
  baseUrl: `http://localhost:${env.PORT}/api`,
  docsUrl: "",
  tags: ["auth"],
});

import { PrismaClient } from "database";
import { pagination } from "prisma-extension-pagination";

export const prisma = new PrismaClient({ log: ["error", "warn"] }).$extends(
  pagination()
);

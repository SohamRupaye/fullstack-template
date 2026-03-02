import { TRPCError } from "@trpc/server";
import { logErrorToFile, logToFile } from "../../utils/log.util";
import { getPrismaError } from "../../utils/prisma.util";

const loggingTRPCMiddleware = async ({
  path,
  type,
  next,
}: {
  path: string;
  type: string;
  next: () => Promise<any>;
}) => {
  const result = await next();

  if (result.ok) {
    logToFile({ path, type });
  } else {
    const { error } = result;

    // Log the actual error to the file
    logErrorToFile({ error, path, type });

    // 1. Handle Prisma constraint/validation errors
    const { errorCode, message } = getPrismaError(error.cause);

    if (errorCode) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: message,
        cause: error.cause,
      });
    }

    // 2. Do NOT mask TRPCError instances with INTERNAL_SERVER_ERROR
    if (error instanceof TRPCError || error.name === "TRPCError") {
      throw error;
    }

    // 3. Everything else becomes a generic 500
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error occurred",
      cause: error.cause,
    });
  }

  return result;
};

export default loggingTRPCMiddleware;

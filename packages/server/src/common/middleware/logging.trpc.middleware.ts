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
  // First log to the logs.jsonl file,
  // Then try to execute the trpc query. If it passes, do nothing,
  // if it fails, log the error to the errors.jsonl file
  // check if its a prisma error, if it is, then throw the appropriate error message
  // else throw a generic error

  const result = await next();

  if (result.ok) {
    logToFile({ path, type });
  } else {
    const { error } = result;
    console.log("MIDDLEWARE CAUGHT ERROR" + error);

    logErrorToFile({ error, path, type });

    const { errorCode, message } = getPrismaError(error.cause);

    if (errorCode) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: message,
        cause: error.cause,
      });
    }

    // Do NOT mask TRPCError instances with INTERNAL_SERVER_ERROR
    if (error instanceof TRPCError || error.name === "TRPCError") {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      cause: error.cause,
    });
  }

  return result;
};

export default loggingTRPCMiddleware;

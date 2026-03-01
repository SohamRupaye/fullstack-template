import fs from "fs";
import nodePath from "path";
import { uuidv4 } from "zod/v4";
const LOG_FILE_PATH = "logs/logs.jsonl";
const ERROR_FILE_PATH = "logs/errors.jsonl";

const logsDir = nodePath.join(process.cwd(), "logs");

export const logToFile = async ({
  path,
  type,
}: {
  path: string;
  type: string;
}) => {
  const logEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    path,
    type,
  };

  // Check if the logs directory exists; if not, create it
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.appendFileSync(
    nodePath.join(process.cwd(), LOG_FILE_PATH),
    JSON.stringify(logEntry) + "\n"
  );
};

export const logErrorToFile = ({
  error,
  path,
  type,
  additionalMetadata,
}: {
  error: any;
  path: string;
  type: string;
  additionalMetadata?: Record<string, any>;
}) => {
  const errorId = uuidv4();
  const timestamp = new Date().toISOString();

  const errorEntry = {
    id: errorId,
    error: String(error),
    path,
    type,
    timestamp,
    additionalMetadata,
  };

  // Check if the logs directory exists; if not, create it
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.appendFileSync(
    nodePath.join(process.cwd(), ERROR_FILE_PATH),
    JSON.stringify(errorEntry) + "\n"
  );
  return errorId;
};

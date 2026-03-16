import fs from "fs";
import fsPromises from "fs/promises";
import nodePath from "path";
import { uuidv4 } from "zod/v4";

const LOG_FILE_PATH = "logs/logs.jsonl";
const ERROR_FILE_PATH = "logs/errors.jsonl";
const logsDir = nodePath.join(process.cwd(), "logs");

// Ensure logs directory exists at startup
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class BufferedLogger {
  private logBuffer: string[] = [];
  private errorBuffer: string[] = [];
  private readonly maxBufferSize = 100;
  private flushIntervalId: NodeJS.Timeout;
  private isFlushing = false;

  constructor() {
    // Flush every 5 seconds asynchronously
    this.flushIntervalId = setInterval(() => this.flush(), 5000);

    // Ensure logs are flushed when the process crashes or gets killed
    const cleanup = () => {
      this.flushSync();
    };

    process.on("exit", cleanup);
    process.on("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
  }

  public async logToFile({ path, type }: { path: string; type: string }) {
    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      path,
      type,
    };

    this.logBuffer.push(JSON.stringify(logEntry) + "\n");

    // Flush immediately if buffer reaches its maximum allowed size
    if (this.logBuffer.length >= this.maxBufferSize) {
      await this.flush();
    }
  }

  public logErrorToFile({
    error,
    path,
    type,
    additionalMetadata,
  }: {
    error: any;
    path: string;
    type: string;
    additionalMetadata?: Record<string, any>;
  }) {
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

    this.errorBuffer.push(JSON.stringify(errorEntry) + "\n");

    // Flush immediately if buffer reaches its maximum allowed size
    if (this.errorBuffer.length >= this.maxBufferSize) {
      this.flush().catch((err) =>
        console.error("Failed to flush error logs:", err)
      );
    }

    return errorId;
  }

  public async flush() {
    if (this.isFlushing) return;
    this.isFlushing = true;

    try {
      // Empty the array into write buffers
      const logsToWrite = this.logBuffer.splice(0, this.logBuffer.length);
      const errorsToWrite = this.errorBuffer.splice(0, this.errorBuffer.length);

      const promises = [];

      if (logsToWrite.length > 0) {
        promises.push(
          fsPromises.appendFile(
            nodePath.join(process.cwd(), LOG_FILE_PATH),
            logsToWrite.join("")
          )
        );
      }

      if (errorsToWrite.length > 0) {
        promises.push(
          fsPromises.appendFile(
            nodePath.join(process.cwd(), ERROR_FILE_PATH),
            errorsToWrite.join("")
          )
        );
      }

      await Promise.all(promises);
    } catch (e) {
      console.error("Failed to asynchronously flush logs:", e);
    } finally {
      this.isFlushing = false;
    }
  }

  // Synchronous flush for process exit events
  private flushSync() {
    try {
      const logsToWrite = this.logBuffer.splice(0, this.logBuffer.length);
      const errorsToWrite = this.errorBuffer.splice(0, this.errorBuffer.length);

      if (logsToWrite.length > 0) {
        fs.appendFileSync(
          nodePath.join(process.cwd(), LOG_FILE_PATH),
          logsToWrite.join("")
        );
      }

      if (errorsToWrite.length > 0) {
        fs.appendFileSync(
          nodePath.join(process.cwd(), ERROR_FILE_PATH),
          errorsToWrite.join("")
        );
      }
    } catch (e) {
      console.error("Failed to synchronously flush logs during exit:", e);
    }
  }
}

const logger = new BufferedLogger();

export const logToFile = logger.logToFile.bind(logger);
export const logErrorToFile = logger.logErrorToFile.bind(logger);

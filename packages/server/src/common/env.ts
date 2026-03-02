import { z } from "zod";

/**
 * If any of these are missing or invalid when the server starts,
 * the application will crash with a detailed error.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("4000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection URL"),
  RSA_PRIVATE_KEY: z.string().optional(),
  RSA_PUBLIC_KEY: z.string().optional(),
  BASE_FILE_UPLOAD_PATH_EXPRESS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:");
  _env.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path[0]}: ${issue.message}`);
  });

  process.exit(1);
}

export const env = _env.data;

/**
 * Helper to ensure the exported env matches NodeJS.ProcessEnv
 * type so TS language server doesn't complain about process.env fallback usage
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

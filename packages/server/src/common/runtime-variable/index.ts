import * as path from "path";
import * as dotenv from "dotenv";

// Load root .env manually
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// dotenvx injects env vars before this module runs.
// We parse RSA_PAIR safely so the server boots regardless of auth strategy chosen.

type RSAKeyPair = { publicKey: string; privateKey: string } | null;

function parseRSAPair(): RSAKeyPair {
  try {
    const raw = process.env.RSA_PAIR;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RSAKeyPair;
    if (!parsed) return null;
    return {
      publicKey: parsed.publicKey?.replaceAll("\\n", "\n") ?? "",
      privateKey: parsed.privateKey?.replaceAll("\\n", "\n") ?? "",
    };
  } catch {
    console.warn(
      "[runtime-variable] RSA_PAIR is not set or malformed — JWT auth will be disabled"
    );
    return null;
  }
}

export const RUNTIME_VARIABLES = {
  RSA_PAIR: parseRSAPair(),
};

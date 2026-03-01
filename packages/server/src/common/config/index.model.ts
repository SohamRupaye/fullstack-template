import { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

export interface Config {
  jwt: SignOptions;
  rsa: crypto.RSAKeyPairOptions<"pem", "pem">;
}

import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../common/config";
import { RUNTIME_VARIABLES } from "../common/runtime-variable";

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, 10);
export const comparePasswords = async (plain: string, hashed: string) =>
  bcrypt.compare(plain, hashed);

export const signJWT = (
  payload: object,
  expiresIn: string | number = config.jwt.expiresIn as string
): string => {
  if (!RUNTIME_VARIABLES.RSA_PAIR) {
    throw new Error(
      "RSA_PAIR is not configured. Set it in .env.dev or switch auth strategy."
    );
  }
  return jwt.sign(payload, RUNTIME_VARIABLES.RSA_PAIR.privateKey, {
    algorithm: "RS256",
    expiresIn,
  } as jwt.SignOptions);
};

export const verifyJWT = (token: string): JwtPayload | null => {
  if (!RUNTIME_VARIABLES.RSA_PAIR) return null;
  try {
    return jwt.verify(token, RUNTIME_VARIABLES.RSA_PAIR.publicKey, {
      algorithms: ["RS256"],
    }) as JwtPayload;
  } catch {
    return null;
  }
};

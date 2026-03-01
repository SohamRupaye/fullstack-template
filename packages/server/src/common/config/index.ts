import { Config } from "./index.model";

const config: Config = {
  jwt: {
    algorithm: "RS256",
    expiresIn: "7d",
  },
  rsa: {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  },
};
export default config;

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "./common/env"; // VALIDATE ENV VARS IMMEDIATELY ON STARTUP
import portalRouter from "./router/router";
import { env } from "./common/env";

// AppRouter type is exported for use by the web package (type-safe tRPC client)
export type { AppRouter } from "./router/router";

const PORT = env.PORT;

const app = express();
app.use(cors());

// API Rate Limiter
// Limits each IP to 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter, portalRouter);

// Static file serving via express
// app.use("/files", express.static(path.resolve(`${__dirname}/${process.env.BASE_FILE_UPLOAD_PATH_EXPRESS}`)));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

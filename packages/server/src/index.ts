import express from "express";
import cors from "cors";
import portalRouter from "./router/router";

// AppRouter type is exported for use by the web package (type-safe tRPC client)
export type { AppRouter } from "./router/router";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

app.use("/api", portalRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

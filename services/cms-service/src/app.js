import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { middleware, utils, constants } from "../../../shared/index.js";
import routes from "./routes/index.js";

const { statusCodes } = constants;
const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

app.use(middleware.rateLimiter);

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CMS Service Running 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "cms-service" });
});

app.use((req, res) => {
  res.status(statusCodes.HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

if (middleware.errorMiddleware) {
  app.use(middleware.errorMiddleware);
}

export default app;

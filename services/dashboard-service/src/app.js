import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import { middleware, utils, constants } from "../../../shared/index.js";
const { statusCodes } = constants;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* CONFIGURE APP */
utils.configureApp(app);

/* RATE LIMIT */
app.use(middleware.rateLimiter);

/* BASE ROUTE */
app.use("/api/v1/dashboard", dashboardRoutes);

/* ROOT */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard Service Running 🚀",
  });
});

/* HEALTH */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "dashboard-service",
  });
});

/* 404 */
app.use((req, res) => {
  res.status(statusCodes.HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

/* ERROR HANDLER */
app.use(middleware.errorMiddleware);

export default app;

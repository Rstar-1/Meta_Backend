import express from "express";
import { middleware, utils } from "../../../shared/index.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

// ================= GLOBAL MIDDLEWARE =================
utils.configureApp(app);

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "taskmanager-service",
    message: "Task Manager Service is running 🚀"
  });
});

// ================= ROUTES =================
app.use("/api/tasks", taskRoutes);

// ================= GLOBAL ERROR HANDLER =================
app.use(middleware.errorMiddleware);

export default app;

import express from "express";
import { middleware, utils } from "../../../shared/index.js";
import noteRoutes from "./routes/note.routes.js";

const app = express();

// ================= GLOBAL MIDDLEWARE =================
utils.configureApp(app);

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "note-service",
    message: "Note Service is running 🚀"
  });
});

// ================= ROUTES =================
app.use("/api/notes", noteRoutes);

// ================= GLOBAL ERROR HANDLER =================
app.use(middleware.errorMiddleware);

export default app;

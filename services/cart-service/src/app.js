import express from "express";
import { middleware, utils } from "../../../shared/index.js";
import mainRoutes from "./routes/index.js";



const app = express();

// ================= GLOBAL MIDDLEWARE =================
utils.configureApp(app);

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    service: "cart-service",
    message: "Cart Service is running 🚀",
  });
});

// ================= ROUTES =================
app.use("/api", mainRoutes);

// ================= GLOBAL ERROR HANDLER =================
app.use(middleware.errorMiddleware);

export default app;

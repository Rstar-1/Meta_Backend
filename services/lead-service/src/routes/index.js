import express from "express";
import leadRoutes from "../modules/lead/lead.routes.js";

const router = express.Router();

router.use("/leads", leadRoutes);

export default router;

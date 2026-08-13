import express from "express";
import { createProxy } from "../utils/proxy.js";
import { env } from "../config/env.js";

const router = express.Router();

router.use("/api/v1/dashboard", createProxy(env.DASHBOARD_SERVICE_URL));

export default router;

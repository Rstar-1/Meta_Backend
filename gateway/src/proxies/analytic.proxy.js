import express from "express";
import { createProxy } from "../utils/proxy.js";
import { env } from "../config/env.js";

const router = express.Router();

router.use("/api/v1/analytics", createProxy(env.ANALYTIC_SERVICE_URL));

export default router;

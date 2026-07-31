import express from "express";
import { createProxy } from "../utils/proxy.js";
import { env } from "../config/env.js";

const router = express.Router();

// Route to github-service
router.use("/api/github", createProxy(env.GITHUB_SERVICE_URL));

export default router;

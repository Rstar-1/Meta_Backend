import express from "express";
import githubRoutes from "../modules/github/github.routes.js";

const router = express.Router();

router.use("/github", githubRoutes);

export default router;

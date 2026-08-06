import express from "express";
import seoRoutes from "../modules/seo/seo.routes.js";

const router = express.Router();

router.use("/seo", seoRoutes);

export default router;

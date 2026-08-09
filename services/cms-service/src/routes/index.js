import express from "express";
import cmsRoutes from "../modules/cms/cms.routes.js";

const router = express.Router();

router.use("/cms", cmsRoutes);

export default router;

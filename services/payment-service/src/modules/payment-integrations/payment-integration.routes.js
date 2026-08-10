import express from "express";
import * as integrationController from "./payment-integration.controller.js";
import { middleware } from "../../../../../shared/index.js";

const { authMiddleware, authorizeRoles } = middleware;
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("admin")); // Integrations are admin-only settings

router.post("/", integrationController.createIntegration);
router.get("/", integrationController.getAllIntegrations);
router.get("/:id", integrationController.getIntegration);
router.put("/:id", integrationController.updateIntegration);
router.delete("/:id", integrationController.deleteIntegration);
router.patch("/:id/status", integrationController.updateStatus);

export default router;

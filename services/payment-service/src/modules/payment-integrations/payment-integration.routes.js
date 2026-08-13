import express from "express";
import * as integrationController from "./payment-integration.controller.js";
import { middleware } from "../../../../../shared/index.js";

const { authMiddleware, authorizeRoles } = middleware;
const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizeRoles("admin", "vendor"), integrationController.getAllIntegrations);
router.get("/:id", authorizeRoles("admin", "vendor"), integrationController.getIntegration);

router.post("/", authorizeRoles("admin"), integrationController.createIntegration);
router.put("/:id", authorizeRoles("admin"), integrationController.updateIntegration);
router.delete("/:id", authorizeRoles("admin"), integrationController.deleteIntegration);
router.patch("/:id/status", authorizeRoles("admin"), integrationController.updateStatus);

export default router;

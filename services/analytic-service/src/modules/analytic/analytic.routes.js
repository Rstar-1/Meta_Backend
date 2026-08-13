import express from "express";
import * as analyticController from "./analytic.controller.js";
import { middleware } from "../../../../../shared/index.js";

const { authMiddleware, authorizeRoles } = middleware;
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("admin", "vendor"));

router.get("/articles", analyticController.getArticlesAnalytics);
router.get("/products", analyticController.getProductsAnalytics);
router.get("/orders", analyticController.getOrdersAnalytics);
router.get("/payments", analyticController.getPaymentsAnalytics);
router.get("/users", analyticController.getUsersAnalytics);
router.get("/leads", analyticController.getLeadsAnalytics);

export default router;

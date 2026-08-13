import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import { middleware } from "../../../../../shared/index.js";

const { authMiddleware, authorizeRoles } = middleware;
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("admin", "vendor"));

router.get("/leads/total", dashboardController.getTotalLeads);
router.get("/earnings/weekly", dashboardController.getWeeklyEarnings);
router.get("/leads/weekly", dashboardController.getWeeklyLeads);
router.get("/products/top", dashboardController.getTopProducts);
router.get("/revenue/yearly", dashboardController.getYearlyRevenue);
router.get("/best-seller", dashboardController.getBestSeller);
router.get("/orders/status", dashboardController.getOrderStatusStats);

export default router;

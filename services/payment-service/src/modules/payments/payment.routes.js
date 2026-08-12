import express from "express";
import * as paymentController from "./payment.controller.js";
import { middleware } from "../../../../../shared/index.js";

const { authMiddleware } = middleware;
const router = express.Router();

// Public webhook endpoint
router.post("/webhook", paymentController.webhook);

// Protected endpoints
router.use(authMiddleware);

router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.post("/cod", paymentController.handleCod);
router.post("/refund", paymentController.refund);
router.get("/", paymentController.getAllPayments);
router.get("/:id", paymentController.getPayment);
router.patch("/:id/status", paymentController.updatePaymentStatus);

export default router;

import express from "express";
import paymentRoutes from "../modules/payments/payment.routes.js";
import paymentIntegrationRoutes from "../modules/payment-integrations/payment-integration.routes.js";

const router = express.Router();

router.use("/payments", paymentRoutes);
router.use("/payment-integrations", paymentIntegrationRoutes);

export default router;

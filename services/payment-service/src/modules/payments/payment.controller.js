import * as paymentService from "./payment.service.js";
import { utils } from "../../../../../shared/index.js";

const { successResponse, asyncHandler } = utils;

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { orderId, amount, provider } = req.body;
  const token = req.headers.authorization;
  const orderDetails = await paymentService.createOrderFlow(userId, orderId, amount, provider, token);
  return successResponse(res, orderDetails, "Payment order/intent created successfully");
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const paymentData = req.body;
  const token = req.headers.authorization;
  const result = await paymentService.verifyPaymentFlow(userId, paymentData, token);
  return successResponse(res, result.payment, result.message);
});

export const handleCod = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { orderId, amount } = req.body;
  const token = req.headers.authorization;
  const result = await paymentService.handleCodPayment(userId, orderId, amount, token);
  return successResponse(res, result, result.message);
});

export const getPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentById(id, req.user);
  return successResponse(res, payment, "Payment details fetched");
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getAllPayments(req.query, req.user);
  return successResponse(res, payments, "Payments fetched successfully");
});

export const refund = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const token = req.headers.authorization;
  const result = await paymentService.refundPayment(userId, req.body, token);
  return successResponse(res, result, "Refund processed successfully");
});

export const webhook = asyncHandler(async (req, res) => {
  const signatureHeader = req.headers["x-razorpay-signature"];
  const result = await paymentService.handleWebhook(req.body, signatureHeader);
  return successResponse(res, result, "Webhook processed successfully");
});

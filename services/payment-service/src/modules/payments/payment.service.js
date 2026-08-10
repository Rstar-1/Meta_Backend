import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import { ENV } from "../../config/env.js";
import { models } from "../../../../../shared/index.js";

const { Payment, PaymentIntegration } = models;

const getRazorpayInstance = async () => {
  let integration = await PaymentIntegration.findOne({ status: "active", isDefault: true });
  if (!integration) {
    integration = await PaymentIntegration.findOne({ status: "active" });
  }

  if (integration) {
    return {
      instance: new Razorpay({
        key_id: integration.keyId,
        key_secret: integration.keySecret,
      }),
      keySecret: integration.keySecret,
      webhookSecret: integration.webhookSecret
    };
  }

  return {
    instance: new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    }),
    keySecret: ENV.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ""
  };
};

const transformPayment = (payment) => {
  if (!payment) return null;
  const obj = payment.toObject ? payment.toObject() : payment;

  const order = obj.orderId && typeof obj.orderId === 'object' ? obj.orderId : null;
  const customer = obj.customerId && typeof obj.customerId === 'object' ? obj.customerId : null;

  let paidAtText = "—";
  if (obj.paidAt) {
    const d = new Date(obj.paidAt);
    paidAtText = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } else if (obj.createdAt) {
    const d = new Date(obj.createdAt);
    paidAtText = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return {
    ...obj,
    id: obj._id,
    paymentId: obj.paymentId || `#PAY-${obj._id.toString().substring(18).toUpperCase()}`,
    orderIdText: order ? (order.id || `#ORD-${order._id.toString().substring(18).toUpperCase()}`) : (obj.orderId ? obj.orderId.toString() : "—"),
    customerText: customer ? (customer.fullname || customer.email || "Guest") : "Guest",
    amountText: obj.amount !== undefined ? (typeof obj.amount === 'number' ? `₹ ${obj.amount}` : obj.amount) : "₹ 0",
    gateway: obj.gateway || "Razorpay",
    paymentMethod: obj.paymentMethod || "Razorpay",
    status: obj.status ? capitalize(obj.status) : "Created",
    paidAtText: paidAtText
  };
};

export const createRazorpayOrder = async (userId, orderId, amount, token) => {
  const { instance } = await getRazorpayInstance();
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_${orderId}`,
  };

  const razorpayOrder = await instance.orders.create(options);

  const payment = await Payment.create({
    customerId: userId,
    orderId,
    amount,
    currency: "INR",
    gateway: "Razorpay",
    paymentMethod: "Razorpay",
    status: "created",
    razorpayOrderId: razorpayOrder.id,
  });

  return { ...razorpayOrder, paymentId: payment.paymentId };
};

export const verifyPayment = async (userId, paymentData, token) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = paymentData;
  const { instance, keySecret } = await getRazorpayInstance();

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", keySecret)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    let paymentMethod = "Razorpay";
    try {
      const rzPayment = await instance.payments.fetch(razorpay_payment_id);
      paymentMethod = rzPayment.method ? capitalizeMethod(rzPayment.method) : "Razorpay";
    } catch (e) {
      console.error("Failed to fetch Razorpay payment details:", e.message);
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "captured",
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod,
        paidAt: new Date(),
      },
      { new: true }
    ).populate("orderId").populate("customerId");

    // Update order status in order-service
    await axios.put(`${ENV.ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
      paymentStatus: "paid",
      paymentMethod: paymentMethod,
      razorpayOrderId: razorpay_order_id
    }, {
      headers: { Authorization: token }
    });

    return { success: true, message: "Payment verified successfully", payment: transformPayment(payment) };
  } else {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: "failed", failureReason: "Signature verification failed" }
    );
    throw new Error("Invalid payment signature");
  }
};

const capitalizeMethod = (str) => {
  if (!str) return "Razorpay";
  if (str.toLowerCase() === "upi") return "UPI";
  if (str.toLowerCase() === "card" || str.toLowerCase() === "cards") return "Card";
  if (str.toLowerCase() === "netbanking") return "NetBanking";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const handleCodPayment = async (userId, orderId, amount, token) => {
  const payment = await Payment.create({
    customerId: userId,
    orderId,
    amount,
    currency: "INR",
    gateway: "COD",
    paymentMethod: "COD",
    status: "created",
  });

  await axios.put(`${ENV.ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
    paymentStatus: "pending",
    paymentMethod: "COD"
  }, {
    headers: { Authorization: token }
  });

  return { success: true, message: "COD order placed successfully", payment: transformPayment(payment) };
};

export const getPaymentById = async (id, userObj = null) => {
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { $or: [{ _id: id }, { paymentId: id }] } : { paymentId: id };

  const payment = await Payment.findOne(query).populate("orderId").populate("customerId");
  if (!payment) throw new Error("Payment not found");
  
  if (userObj && userObj.role === "user" && payment.customerId?.toString() !== (userObj._id || userObj.id)?.toString()) {
    throw new Error("Unauthorized access to payment transaction");
  }
  return transformPayment(payment);
};

export const getAllPayments = async (filters = {}, userObj = null) => {
  const query = {};
  if (userObj && userObj.role === "user") {
    query.customerId = userObj._id || userObj.id;
  }
  
  if (filters.status && filters.status !== "All") {
    query.status = filters.status.toLowerCase();
  }
  if (filters.orderId) {
    query.orderId = filters.orderId;
  }

  const payments = await Payment.find(query).populate("orderId").populate("customerId").sort({ createdAt: -1 });
  return payments.map(transformPayment);
};

export const refundPayment = async (userId, data, token) => {
  const { orderId, amount, reason } = data;
  
  const payment = await Payment.findOne({ orderId, status: "captured" });
  if (!payment) {
    throw new Error("No captured payment found for this order");
  }

  const { instance } = await getRazorpayInstance();
  
  const refundOptions = {
    payment_id: payment.razorpayPaymentId,
    amount: Math.round((amount || payment.amount) * 100),
    notes: {
      reason: reason || "Customer request",
      refundedBy: userId
    }
  };

  const refund = await instance.payments.refund(refundOptions.payment_id, {
    amount: refundOptions.amount,
    notes: refundOptions.notes
  });

  payment.status = "refunded";
  await payment.save();

  await axios.put(`${ENV.ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
    paymentStatus: "refunded"
  }, {
    headers: { Authorization: token }
  });

  return transformPayment(payment);
};

export const handleWebhook = async (body, signatureHeader) => {
  const { webhookSecret } = await getRazorpayInstance();

  if (webhookSecret && signatureHeader) {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signatureHeader) {
      throw new Error("Invalid webhook signature");
    }
  }

  const event = body.event;
  const paymentEntity = body.payload?.payment?.entity;

  if (paymentEntity) {
    const rzpOrderId = paymentEntity.order_id;
    const rzpPaymentId = paymentEntity.id;
    
    if (event === "payment.captured") {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        { 
          status: "captured", 
          razorpayPaymentId: rzpPaymentId,
          paymentMethod: paymentEntity.method ? capitalizeMethod(paymentEntity.method) : "Razorpay",
          paidAt: new Date()
        }
      );
    } else if (event === "payment.failed") {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        { 
          status: "failed", 
          razorpayPaymentId: rzpPaymentId,
          failureReason: paymentEntity.error_description || "Payment failed"
        }
      );
    }
  }

  return { success: true };
};

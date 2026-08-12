import Razorpay from "razorpay";
import Stripe from "stripe";
import crypto from "crypto";
import axios from "axios";
import { ENV } from "../../config/env.js";
import { models } from "../../../../../shared/index.js";

const { Payment, PaymentIntegration } = models;

const getIntegrationConfig = async (providerName) => {
  let integration;
  if (providerName) {
    integration = await PaymentIntegration.findOne({
      status: "active",
      provider: { $regex: new RegExp(`^${providerName}$`, "i") }
    });
  } else {
    integration = await PaymentIntegration.findOne({ status: "active", isDefault: true });
    if (!integration) {
      integration = await PaymentIntegration.findOne({ status: "active" });
    }
  }

  if (integration) {
    return {
      provider: integration.provider,
      keyId: integration.keyId,
      keySecret: integration.keySecret,
      webhookSecret: integration.webhookSecret,
      mode: integration.mode || "test"
    };
  }

  // Fallback environment variables
  const p = (providerName || "Razorpay").toLowerCase();
  if (p === "stripe") {
    return {
      provider: "Stripe",
      keyId: process.env.STRIPE_PUBLISHABLE_KEY || "",
      keySecret: process.env.STRIPE_SECRET_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
      mode: process.env.STRIPE_MODE || "test"
    };
  }
  if (p === "cashfree") {
    return {
      provider: "Cashfree",
      keyId: process.env.CASHFREE_APP_ID || "",
      keySecret: process.env.CASHFREE_SECRET_KEY || "",
      webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET || "",
      mode: process.env.CASHFREE_MODE || "test"
    };
  }
  if (p === "payu") {
    return {
      provider: "PayU",
      keyId: process.env.PAYU_MERCHANT_KEY || "",
      keySecret: process.env.PAYU_MERCHANT_SALT || "",
      webhookSecret: process.env.PAYU_WEBHOOK_SECRET || "",
      mode: process.env.PAYU_MODE || "test"
    };
  }

  return {
    provider: "Razorpay",
    keyId: ENV.RAZORPAY_KEY_ID || "",
    keySecret: ENV.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    mode: "test"
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

  const gatewayName = obj.gateway || "Razorpay";
  let displayOrderId = obj.gatewayOrderId || obj.razorpayOrderId;
  if ((!displayOrderId || displayOrderId === "—") && gatewayName !== "COD") {
    const randomSuffix = obj._id ? obj._id.toString().substring(18).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefixMap = {
      Razorpay: "order_rp_",
      Stripe: "pi_st_",
      Cashfree: "cf_order_",
      PayU: "payu_tx_"
    };
    const prefix = prefixMap[gatewayName] || "order_gt_";
    displayOrderId = `${prefix}${randomSuffix}`;
  }

  let displayPaymentId = obj.gatewayPaymentId || obj.razorpayPaymentId;
  if ((!displayPaymentId || displayPaymentId === "—") && (obj.status?.toLowerCase() === "captured" || obj.status?.toLowerCase() === "paid") && gatewayName !== "COD") {
    const randomSuffix = obj._id ? obj._id.toString().substring(18).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefixMap = {
      Razorpay: "pay_rp_",
      Stripe: "ch_st_",
      Cashfree: "cf_pay_",
      PayU: "payu_pg_"
    };
    const prefix = prefixMap[gatewayName] || "pay_gt_";
    displayPaymentId = `${prefix}${randomSuffix}`;
  }

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
    paidAtText: paidAtText,
    gatewayOrderIdText: displayOrderId || "—",
    gatewayPaymentIdText: displayPaymentId || "—",
    addedOnText: obj.createdAt ? new Date(obj.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"
  };
};

export const createOrderFlow = async (userId, orderId, amount, providerName, token) => {
  const config = await getIntegrationConfig(providerName);
  const provider = config.provider.toLowerCase();

  if (provider === "stripe") {
    const stripe = new Stripe(config.keySecret);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      metadata: { orderId: orderId.toString(), customerId: userId.toString() }
    });

    const payment = await Payment.create({
      customerId: userId,
      orderId,
      amount,
      currency: "INR",
      gateway: "Stripe",
      paymentMethod: "Stripe",
      status: "created",
      gatewayOrderId: paymentIntent.id
    });

    return {
      provider: "Stripe",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: config.keyId,
      paymentId: payment.paymentId
    };
  }

  if (provider === "cashfree") {
    const isProd = config.mode === "live";
    const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
    const cfOrderId = `cf_${orderId}_${Date.now().toString().substring(8)}`;

    try {
      const response = await axios.post(`${baseUrl}/orders`, {
        order_amount: amount,
        order_currency: "INR",
        order_id: cfOrderId,
        customer_details: {
          customer_id: userId.toString(),
          customer_phone: "9999999999",
          customer_email: "customer@example.com"
        }
      }, {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": config.keyId,
          "x-client-secret": config.keySecret,
          "Content-Type": "application/json"
        }
      });

      const payment = await Payment.create({
        customerId: userId,
        orderId,
        amount,
        currency: "INR",
        gateway: "Cashfree",
        paymentMethod: "Cashfree",
        status: "created",
        gatewayOrderId: cfOrderId
      });

      return {
        provider: "Cashfree",
        paymentSessionId: response.data.payment_session_id,
        cfOrderId: cfOrderId,
        paymentId: payment.paymentId
      };
    } catch (e) {
      console.error("Cashfree order creation error:", e.response?.data || e.message);
      throw new Error(`Cashfree order creation failed: ${e.response?.data?.message || e.message}`);
    }
  }

  if (provider === "payu") {
    const txnid = `tx_${orderId}_${Date.now().toString().substring(8)}`;
    const productinfo = `Order_${orderId}`;
    const firstname = "Customer";
    const email = "customer@example.com";
    const phone = "9999999999";

    const hashString = `${config.keyId}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${config.keySecret}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    const payment = await Payment.create({
      customerId: userId,
      orderId,
      amount,
      currency: "INR",
      gateway: "PayU",
      paymentMethod: "PayU",
      status: "created",
      gatewayOrderId: txnid
    });

    const actionUrl = config.mode === "live" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";

    return {
      provider: "PayU",
      key: config.keyId,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${ENV.ORDER_SERVICE_URL}/api/payments/verify?provider=PayU&orderId=${orderId}`,
      furl: `${ENV.ORDER_SERVICE_URL}/api/payments/verify?provider=PayU&orderId=${orderId}`,
      hash,
      action: actionUrl,
      paymentId: payment.paymentId
    };
  }

  // Default to Razorpay
  const instance = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
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
    gatewayOrderId: razorpayOrder.id
  });

  return { ...razorpayOrder, paymentId: payment.paymentId, provider: "Razorpay" };
};

export const verifyPaymentFlow = async (userId, paymentData, token) => {
  const { provider, orderId } = paymentData;
  const config = await getIntegrationConfig(provider);
  const providerLower = config.provider.toLowerCase();

  let isVerified = false;
  let transactionId = "";
  let paymentMethod = config.provider;

  if (providerLower === "stripe") {
    const { paymentIntentId } = paymentData;
    const stripe = new Stripe(config.keySecret);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      isVerified = true;
      transactionId = paymentIntentId;
      paymentMethod = paymentIntent.payment_method_types?.[0] || "Stripe";
    }
  }

  else if (providerLower === "cashfree") {
    const { cfOrderId } = paymentData;
    const isProd = config.mode === "live";
    const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

    try {
      const response = await axios.get(`${baseUrl}/orders/${cfOrderId}`, {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": config.keyId,
          "x-client-secret": config.keySecret
        }
      });

      if (response.data.order_status === "PAID") {
        isVerified = true;
        transactionId = cfOrderId;
        paymentMethod = "Cashfree";
      }
    } catch (e) {
      console.error("Cashfree verification error:", e.response?.data || e.message);
      throw new Error(`Cashfree payment verification failed: ${e.response?.data?.message || e.message}`);
    }
  }

  else if (providerLower === "payu") {
    const { status, txnid } = paymentData;
    if (status === "success") {
      isVerified = true;
      transactionId = txnid;
      paymentMethod = "PayU";
    }
  }

  else {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", config.keySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      isVerified = true;
      transactionId = razorpay_payment_id;

      try {
        const instance = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
        const rzPayment = await instance.payments.fetch(razorpay_payment_id);
        paymentMethod = rzPayment.method ? capitalizeMethod(rzPayment.method) : "Razorpay";
      } catch (e) {
        console.error("Failed to fetch Razorpay details:", e.message);
        paymentMethod = "Razorpay";
      }
    }
  }

  if (isVerified) {
    const query = providerLower === "razorpay"
      ? { razorpayOrderId: paymentData.razorpay_order_id }
      : { gatewayOrderId: paymentData.paymentIntentId || paymentData.cfOrderId || paymentData.txnid || paymentData.gatewayOrderId };

    const payment = await Payment.findOneAndUpdate(
      query,
      {
        status: "captured",
        gatewayPaymentId: transactionId,
        razorpayPaymentId: providerLower === "razorpay" ? transactionId : undefined,
        paymentMethod,
        paidAt: new Date(),
      },
      { new: true }
    ).populate("orderId").populate("customerId");

    await axios.put(`${ENV.ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
      paymentStatus: "paid",
      paymentMethod: paymentMethod,
      gatewayOrderId: transactionId
    }, {
      headers: { Authorization: token }
    });

    return { success: true, message: "Payment verified successfully", payment: transformPayment(payment) };
  } else {
    const query = providerLower === "razorpay"
      ? { razorpayOrderId: paymentData.razorpay_order_id }
      : { gatewayOrderId: paymentData.paymentIntentId || paymentData.cfOrderId || paymentData.txnid || paymentData.gatewayOrderId };

    await Payment.findOneAndUpdate(
      query,
      { status: "failed", failureReason: "Payment verification failed" }
    );
    throw new Error("Payment verification failed");
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

  const role = userObj?.role?.toLowerCase();
  if (userObj && role === "user" && payment.customerId?.toString() !== (userObj._id || userObj.id)?.toString()) {
    throw new Error("Unauthorized access to payment transaction");
  }
  return transformPayment(payment);
};

export const getAllPayments = async (filters = {}, userObj = null) => {
  const query = {};
  const role = userObj?.role?.toLowerCase();
  if (userObj && role === "user") {
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

  const gateway = (payment.gateway || "Razorpay").toLowerCase();
  const config = await getIntegrationConfig(payment.gateway);

  try {
    if (gateway === "razorpay") {
      const instance = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
      const refundOptions = {
        payment_id: payment.razorpayPaymentId || payment.gatewayPaymentId,
        amount: Math.round((amount || payment.amount) * 100),
        notes: {
          reason: reason || "Customer request",
          refundedBy: userId
        }
      };
      await instance.payments.refund(refundOptions.payment_id, {
        amount: refundOptions.amount,
        notes: refundOptions.notes
      });
    }
    else if (gateway === "stripe") {
      const stripe = new Stripe(config.keySecret);
      await stripe.refunds.create({
        payment_intent: payment.gatewayPaymentId,
        amount: Math.round((amount || payment.amount) * 100)
      });
    }
    else if (gateway === "cashfree") {
      const isProd = config.mode === "live";
      const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

      await axios.post(`${baseUrl}/orders/${payment.gatewayOrderId}/refunds`, {
        refund_amount: amount || payment.amount,
        refund_id: `ref_${orderId}_${Date.now().toString().substring(8)}`,
        refund_note: reason || "Customer request"
      }, {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": config.keyId,
          "x-client-secret": config.keySecret,
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error(`Refund failed for ${payment.gateway}:`, error.message);
  }

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
  const { webhookSecret } = await getIntegrationConfig("Razorpay");

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

export const updatePaymentStatusFlow = async (id, status, userObj) => {
  const role = userObj?.role?.toLowerCase();
  if (!userObj || role !== "admin") {
    throw new Error("Only admins can update payment status manually");
  }
  const payment = await Payment.findById(id);
  if (!payment) {
    throw new Error("Payment not found");
  }
  payment.status = status.toLowerCase();
  if (status.toLowerCase() === "captured" && !payment.paidAt) {
    payment.paidAt = new Date();
  }
  await payment.save();
  return transformPayment(payment);
};

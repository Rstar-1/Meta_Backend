import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    gateway: {
      type: String,
      default: "Razorpay"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    amount: Number,
    currency: {
      type: String,
      default: "INR"
    },
    paymentMethod: String,
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created"
    },
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true, versionKey: false }
);

// Pre-validate hook to generate paymentId if not present
paymentSchema.pre("validate", async function () {
  if (this.isNew && !this.paymentId) {
    const PaymentModel = mongoose.model("Payment");
    const lastPayment = await PaymentModel.findOne({ paymentId: /^#PAY-\d{4,}$/ })
      .sort({ createdAt: -1 })
      .select("paymentId");

    let nextNumber = 1001;
    if (lastPayment && lastPayment.paymentId) {
      const match = lastPayment.paymentId.match(/^#PAY-(\d{4,})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    this.paymentId = `#PAY-${nextNumber}`;
  }

  if (!this.gateway) {
    this.gateway = this.paymentMethod || "Razorpay";
  }

  const gatewayName = this.gateway || "Razorpay";

  if ((!this.razorpayOrderId || !String(this.razorpayOrderId).trim()) && gatewayName !== "COD") {
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    const prefixMap = {
      Razorpay: "order_rp_",
      Stripe: "pi_st_",
      Cashfree: "cf_order_",
      PayU: "payu_tx_"
    };
    const prefix = prefixMap[gatewayName] || "order_gt_";
    this.razorpayOrderId = `${prefix}${randomSuffix}`;
  }

  if (!this.gatewayOrderId || !String(this.gatewayOrderId).trim()) {
    this.gatewayOrderId = this.razorpayOrderId;
  }

  if (this.status === "captured" && (!this.razorpayPaymentId || !String(this.razorpayPaymentId).trim()) && gatewayName !== "COD") {
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    const prefixMap = {
      Razorpay: "pay_rp_",
      Stripe: "ch_st_",
      Cashfree: "cf_pay_",
      PayU: "payu_pg_"
    };
    const prefix = prefixMap[gatewayName] || "pay_gt_";
    this.razorpayPaymentId = `${prefix}${randomSuffix}`;
  }

  if (!this.gatewayPaymentId || !String(this.gatewayPaymentId).trim()) {
    this.gatewayPaymentId = this.razorpayPaymentId;
  }
});

export default mongoose.model("Payment", paymentSchema);

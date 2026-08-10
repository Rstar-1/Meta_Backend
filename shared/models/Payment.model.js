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
});

export default mongoose.model("Payment", paymentSchema);

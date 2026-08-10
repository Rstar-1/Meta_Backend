import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: String,
    image: String,

    price: Number,
    quantity: Number,

    variant: {
      size: String,
      color: String,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Custom dashboard / Table fields
    id: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    products: [orderItemSchema],
    orderStatus: {
      type: String,
    },

    // E-commerce/checkout compatibility fields
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    totalAmount: {
      type: mongoose.Schema.Types.Mixed, // Can be number (checkout) or string (dashboard e.g. "₹ 250")
    },

    address: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    razorpayOrderId: String,

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre-validate hook to generate Order ID if not present
orderSchema.pre("validate", async function () {
  if (this.isNew && !this.id) {
    const OrderModel = mongoose.model("Order");
    const lastOrder = await OrderModel.findOne({ id: /^#ORD-\d{4,}$/ })
      .sort({ createdAt: -1 })
      .select("id");

    let nextNumber = 1001;
    if (lastOrder && lastOrder.id) {
      const match = lastOrder.id.match(/^#ORD-(\d{4,})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    this.id = `#ORD-${nextNumber}`;
  }
});

export default mongoose.model("Order", orderSchema);


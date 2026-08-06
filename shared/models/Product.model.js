import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    price: Number,
    stock: Number,
    sku: String,
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    sku: String,

    productCode: String,

    description: String,

    shortDesc: String,

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Reference to User with role "vendor"
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    images: [String],

    basePrice: {
      type: Number,
      required: true,
    },

    unit: String,

    currency: {
      type: String,
      default: "INR",
    },

    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    specifications: [
      {
        name: String,
        value: String,
      }
    ],

    features: [String],

    badges: [String],

    variants: [variantSchema],

    totalStock: {
      type: Number,
      default: 0,
    },

    reservedStock: {
      type: Number,
      default: 0,
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    metaTitle: String,
    metaDesc: String,
    metaKeywords: String,

    reviews: [reviewSchema],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Product", productSchema);

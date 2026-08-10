import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/crypto.js";

const paymentIntegrationSchema = new mongoose.Schema(
  {
    gatewayName: {
      type: String,
      required: true,
      trim: true
    },
    provider: {
      type: String,
      required: true,
      trim: true
    },
    supportedMethods: {
      type: [String],
      enum: ["UPI", "Cards", "Net Banking", "COD"],
      default: []
    },
    mode: {
      type: String,
      enum: ["test", "live"],
      default: "test"
    },
    keyId: {
      type: String,
      required: true,
      trim: true
    },
    keySecret: {
      type: String,
      required: true,
      trim: true,
      get: decrypt,
      set: encrypt
    },
    webhookSecret: {
      type: String,
      trim: true,
      get: decrypt,
      set: encrypt
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: { createdAt: "addedOn", updatedAt: "updatedOn" }, 
    versionKey: false,
    toJSON: { 
      getters: true,
      transform: (doc, ret) => {
        delete ret.keySecret;
        delete ret.webhookSecret;
        return ret;
      }
    },
    toObject: { getters: true }
  }
);

// If marked default, make sure all others are marked non-default
paymentIntegrationSchema.pre("save", async function (next) {
  if (this.isDefault) {
    const PaymentIntegration = mongoose.model("PaymentIntegration");
    await PaymentIntegration.updateMany({ _id: { $ne: this._id } }, { isDefault: false });
  }
  next();
});

export default mongoose.model("PaymentIntegration", paymentIntegrationSchema);

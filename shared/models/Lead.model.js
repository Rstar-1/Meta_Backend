import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    enquiry: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Approved"],
      default: "Pending",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-validate hook to generate Enquiry ID if not present
leadSchema.pre("validate", async function () {
  if (this.isNew && !this.id) {
    const LeadModel = mongoose.model("Lead");
    // Find the last created lead to get the highest sequential number
    const lastLead = await LeadModel.findOne({ id: /^ENQ-\d{4}$/ })
      .sort({ createdAt: -1 })
      .select("id");

    let nextNumber = 1001; // Starting number
    if (lastLead && lastLead.id) {
      const match = lastLead.id.match(/^ENQ-(\d{4})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    this.id = `ENQ-${String(nextNumber).padStart(4, "0")}`;
  }
});

export default mongoose.model("Lead", leadSchema);

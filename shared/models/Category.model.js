import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdByEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    attributes: [
      {
        name: String,
        type: String,
        options: [String],
      },
    ],

    icon: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    number: {
      type: String,
      default: "",
    },

    accentColor: {
      type: String,
      default: "",
    },

    bgColor: {
      type: String,
      default: "",
    },

    iconName: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

export default mongoose.model("Category", categorySchema);

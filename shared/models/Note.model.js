import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String },
    label: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Note", "Workflow"],
      default: "Note",
    },
    content: {
      type: String,
      default: "",
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Note", noteSchema);

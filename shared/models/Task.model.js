import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      trim: true,
    },
    assignee: {
      type: String,
      required: false,
    },
    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed", "Overdue"],
      default: "To Do",
    },
    dueDate: {
      type: Date,
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

export default mongoose.model("Task", taskSchema);

import mongoose from "mongoose";

const githubPullRequestSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ["Open", "Merged", "Closed"], default: "Open" },
    repository: { type: String, required: true },
    timestamp: { type: Date, required: true },
    url: { type: String }
  },
  { timestamps: true, versionKey: false }
);

githubPullRequestSchema.index({ number: 1, repository: 1 }, { unique: true });

export default mongoose.model("GithubPullRequest", githubPullRequestSchema);

import mongoose from "mongoose";

const githubRepositorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    visibility: { type: String, enum: ["Public", "Private"], default: "Public" },
    defaultBranch: { type: String, default: "main" },
    lastCommit: {
      message: { type: String },
      author: { type: String },
      sha: { type: String },
      timestamp: { type: Date }
    },
    updated: { type: Date, default: Date.now },
    branchesCount: { type: Number, default: 0 },
    commitsCount: { type: Number, default: 0 },
    pullRequestsCount: { type: Number, default: 0 },
    status: { type: String, enum: ["Synced", "Syncing", "Error"], default: "Synced" },
    group: { 
      type: String, 
      enum: ["Frontend", "Backend", "Mobile", "DevOps", "Libraries", "Testing", "Archived", "Forks"], 
      default: "Backend" 
    },
    url: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("GithubRepository", githubRepositorySchema);

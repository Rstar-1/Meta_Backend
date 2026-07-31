import mongoose from "mongoose";

const githubBranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    repository: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    protected: { type: Boolean, default: false },
    url: { type: String }
  },
  { timestamps: true, versionKey: false }
);

githubBranchSchema.index({ name: 1, repository: 1 }, { unique: true });

export default mongoose.model("GithubBranch", githubBranchSchema);

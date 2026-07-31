import mongoose from "mongoose";

const githubCommitSchema = new mongoose.Schema(
  {
    sha: { type: String, required: true, unique: true },
    message: { type: String, required: true },
    author: { type: String, required: true },
    authorAvatar: { type: String },
    timestamp: { type: Date, required: true },
    repository: { type: String, required: true },
    url: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("GithubCommit", githubCommitSchema);

import mongoose from "mongoose";

const githubDashboardSchema = new mongoose.Schema(
  {
    totalRepositories: { type: Number, default: 0 },
    totalRepositoriesTrend: { type: Number, default: 0 },
    totalRepositoriesSparkline: { type: [Number], default: [] },

    totalBranches: { type: Number, default: 0 },
    totalBranchesTrend: { type: Number, default: 0 },
    totalBranchesSparkline: { type: [Number], default: [] },

    totalCommits: { type: Number, default: 0 },
    totalCommitsTrend: { type: Number, default: 0 },
    totalCommitsSparkline: { type: [Number], default: [] },

    pullRequests: { type: Number, default: 0 },
    pullRequestsTrend: { type: Number, default: 0 },
    pullRequestsSparkline: { type: [Number], default: [] },

    deployments: { type: Number, default: 0 },
    deploymentsTrend: { type: Number, default: 0 },
    deploymentsSparkline: { type: [Number], default: [] },

    repositoryHealth: {
      healthy: { type: Number, default: 0 },
      warning: { type: Number, default: 0 },
      error: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },

    branchesOverview: [
      {
        name: { type: String, required: true },
        count: { type: Number, default: 0 }
      }
    ],

    pullRequestsOverview: {
      open: { type: Number, default: 0 },
      merged: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("GithubDashboard", githubDashboardSchema);

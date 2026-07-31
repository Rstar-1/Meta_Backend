import { models } from "../../../../../shared/index.js";
import { ENV } from "../../config/env.js";

const { GithubDashboard, GithubRepository, GithubCommit, GithubPullRequest, GithubBranch } = models;


async function fetchGithub(endpoint) {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ecommerce-platform-github-service",
  };
  if (ENV.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${ENV.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API Error: ${res.status} ${res.statusText} at ${endpoint}`);
  }
  return res.json();
}

export async function seedInitialData() {
  const dashboardCount = await GithubDashboard.countDocuments();
  if (dashboardCount > 0) {
    const branchCount = await GithubBranch.countDocuments();
    if (branchCount === 0) {
      const branches = [
        { name: "main", repository: "ecommerce-web", isDefault: true, protected: true, url: "https://github.com/example/ecommerce-web/tree/main" },
        { name: "develop", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/develop" },
        { name: "feature/dashboard", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/feature/dashboard" },
        { name: "feature/payment-gateway", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/feature/payment-gateway" },
        { name: "bugfix/login-styles", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/bugfix/login-styles" },
        
        { name: "develop", repository: "api-gateway", isDefault: true, protected: true, url: "https://github.com/example/api-gateway/tree/develop" },
        { name: "main", repository: "api-gateway", isDefault: false, protected: true, url: "https://github.com/example/api-gateway/tree/main" },
        { name: "feature/rate-limiting", repository: "api-gateway", isDefault: false, protected: false, url: "https://github.com/example/api-gateway/tree/feature/rate-limiting" },
        { name: "feature/jwt-auth", repository: "api-gateway", isDefault: false, protected: false, url: "https://github.com/example/api-gateway/tree/feature/jwt-auth" },
        
        { name: "main", repository: "mobile-app", isDefault: true, protected: true, url: "https://github.com/example/mobile-app/tree/main" },
        { name: "develop", repository: "mobile-app", isDefault: false, protected: false, url: "https://github.com/example/mobile-app/tree/develop" },
        { name: "feature/push-notifications", repository: "mobile-app", isDefault: false, protected: false, url: "https://github.com/example/mobile-app/tree/feature/push-notifications" },
        
        { name: "develop", repository: "user-service", isDefault: true, protected: true, url: "https://github.com/example/user-service/tree/develop" },
        { name: "main", repository: "user-service", isDefault: false, protected: true, url: "https://github.com/example/user-service/tree/main" },
        { name: "feature/social-login", repository: "user-service", isDefault: false, protected: false, url: "https://github.com/example/user-service/tree/feature/social-login" },
        
        { name: "main", repository: "payment-service", isDefault: true, protected: true, url: "https://github.com/example/payment-service/tree/main" },
        { name: "develop", repository: "payment-service", isDefault: false, protected: false, url: "https://github.com/example/payment-service/tree/develop" },
        { name: "feature/stripe-v2", repository: "payment-service", isDefault: false, protected: false, url: "https://github.com/example/payment-service/tree/feature/stripe-v2" }
      ];
      await GithubBranch.insertMany(branches);
    }
    return;
  }

  const initialDashboard = new GithubDashboard({
    totalRepositories: 86,
    totalRepositoriesTrend: 8.5,
    totalRepositoriesSparkline: [65, 68, 70, 72, 75, 78, 80, 82, 85, 86],

    totalBranches: 412,
    totalBranchesTrend: 12.4,
    totalBranchesSparkline: [350, 360, 370, 375, 380, 390, 400, 412],

    totalCommits: 2845,
    totalCommitsTrend: 15.7,
    totalCommitsSparkline: [2500, 2550, 2600, 2650, 2700, 2750, 2800, 2845],

    pullRequests: 128,
    pullRequestsTrend: -4.2,
    pullRequestsSparkline: [140, 138, 135, 132, 130, 129, 128],

    deployments: 64,
    deploymentsTrend: 9.1,
    deploymentsSparkline: [50, 52, 55, 57, 58, 60, 62, 64],

    repositoryHealth: {
      healthy: 62,
      warning: 16,
      error: 8,
      total: 86
    },

    branchesOverview: [
      { name: "main", count: 42 },
      { name: "develop", count: 68 },
      { name: "feature/*", count: 156 },
      { name: "release/*", count: 32 },
      { name: "hotfix/*", count: 18 },
      { name: "other", count: 96 }
    ],

    pullRequestsOverview: {
      open: 45,
      merged: 62,
      closed: 21,
      total: 128
    }
  });
  await initialDashboard.save();

  // Seed initial GithubRepositories
  const repos = [
    {
      name: "ecommerce-web",
      description: "Frontend application",
      visibility: "Public",
      defaultBranch: "main",
      lastCommit: {
        message: "feat: add new dashboard",
        author: "john.doe",
        sha: "a1b2c3d",
        timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 mins ago
      },
      updated: new Date(Date.now() - 2 * 60 * 1000),
      branchesCount: 12,
      commitsCount: 342,
      pullRequestsCount: 5,
      status: "Synced",
      group: "Frontend",
      url: "https://github.com/example/ecommerce-web"
    },
    {
      name: "api-gateway",
      description: "API Gateway service",
      visibility: "Private",
      defaultBranch: "develop",
      lastCommit: {
        message: "fix: resolve rate limit bug",
        author: "janedoe",
        sha: "d4e5f6g",
        timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 mins ago
      },
      updated: new Date(Date.now() - 15 * 60 * 1000),
      branchesCount: 18,
      commitsCount: 256,
      pullRequestsCount: 8,
      status: "Synced",
      group: "Backend",
      url: "https://github.com/example/api-gateway"
    },
    {
      name: "mobile-app",
      description: "iOS & Android app",
      visibility: "Private",
      defaultBranch: "main",
      lastCommit: {
        message: "chore: update dependencies",
        author: "mike.dev",
        sha: "h78j9k",
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      },
      updated: new Date(Date.now() - 60 * 60 * 1000),
      branchesCount: 8,
      commitsCount: 189,
      pullRequestsCount: 3,
      status: "Syncing",
      group: "Mobile",
      url: "https://github.com/example/mobile-app"
    },
    {
      name: "user-service",
      description: "User management service",
      visibility: "Private",
      defaultBranch: "develop",
      lastCommit: {
        message: "feat: implement OAuth",
        author: "11m2n3s",
        sha: "11m2n3s",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      updated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      branchesCount: 14,
      commitsCount: 412,
      pullRequestsCount: 6,
      status: "Synced",
      group: "Backend",
      url: "https://github.com/example/user-service"
    },
    {
      name: "payment-service",
      description: "Payment processing",
      visibility: "Private",
      defaultBranch: "main",
      lastCommit: {
        message: "fix: handle payment failure",
        author: "david.dev",
        sha: "p4q5r6s",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      updated: new Date(Date.now() - 3 * 60 * 60 * 1000),
      branchesCount: 10,
      commitsCount: 298,
      pullRequestsCount: 4,
      status: "Synced",
      group: "Backend",
      url: "https://github.com/example/payment-service"
    }
  ];
  await GithubRepository.insertMany(repos);

  // Seed initial GithubCommits
  const commits = [
    {
      sha: "a1b2c3d",
      message: "feat: add user authentication",
      author: "john.doe",
      authorAvatar: "",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      repository: "ecommerce-web",
      url: "https://github.com/example/ecommerce-web/commit/a1b2c3d"
    },
    {
      sha: "d4e5f6g",
      message: "fix: resolve login issue",
      author: "mike.dev",
      authorAvatar: "",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      repository: "ecommerce-web",
      url: "https://github.com/example/ecommerce-web/commit/d4e5f6g"
    },
    {
      sha: "h78j9k",
      message: "chore: update dependencies",
      author: "sarah.wilson",
      authorAvatar: "",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      repository: "api-gateway",
      url: "https://github.com/example/api-gateway/commit/h78j9k"
    },
    {
      sha: "11m2n3s",
      message: "docs: update README",
      author: "11m2n3s",
      authorAvatar: "",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      repository: "user-service",
      url: "https://github.com/example/user-service/commit/11m2n3s"
    }
  ];
  await GithubCommit.insertMany(commits);

  // Seed initial GithubPullRequests
  const pullRequests = [
    {
      number: 124,
      title: "Merge pull request #124 from feature/user-auth",
      author: "john.doe",
      status: "Merged",
      repository: "api-gateway",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      url: "https://github.com/example/api-gateway/pull/124"
    },
    {
      number: 125,
      title: "Configure checkout UI and payments page integration",
      author: "david.dev",
      status: "Open",
      repository: "payment-service",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      url: "https://github.com/example/payment-service/pull/125"
    },
    {
      number: 126,
      title: "Release v2.3.1 production hotfix build",
      author: "mike.dev",
      status: "Closed",
      repository: "mobile-app",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      url: "https://github.com/example/mobile-app/pull/126"
    }
  ];
  await GithubPullRequest.insertMany(pullRequests);

  // Seed initial GithubBranches
  const branches = [
    { name: "main", repository: "ecommerce-web", isDefault: true, protected: true, url: "https://github.com/example/ecommerce-web/tree/main" },
    { name: "develop", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/develop" },
    { name: "feature/dashboard", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/feature/dashboard" },
    { name: "feature/payment-gateway", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/feature/payment-gateway" },
    { name: "bugfix/login-styles", repository: "ecommerce-web", isDefault: false, protected: false, url: "https://github.com/example/ecommerce-web/tree/bugfix/login-styles" },
    
    { name: "develop", repository: "api-gateway", isDefault: true, protected: true, url: "https://github.com/example/api-gateway/tree/develop" },
    { name: "main", repository: "api-gateway", isDefault: false, protected: true, url: "https://github.com/example/api-gateway/tree/main" },
    { name: "feature/rate-limiting", repository: "api-gateway", isDefault: false, protected: false, url: "https://github.com/example/api-gateway/tree/feature/rate-limiting" },
    { name: "feature/jwt-auth", repository: "api-gateway", isDefault: false, protected: false, url: "https://github.com/example/api-gateway/tree/feature/jwt-auth" },
    
    { name: "main", repository: "mobile-app", isDefault: true, protected: true, url: "https://github.com/example/mobile-app/tree/main" },
    { name: "develop", repository: "mobile-app", isDefault: false, protected: false, url: "https://github.com/example/mobile-app/tree/develop" },
    { name: "feature/push-notifications", repository: "mobile-app", isDefault: false, protected: false, url: "https://github.com/example/mobile-app/tree/feature/push-notifications" },
    
    { name: "develop", repository: "user-service", isDefault: true, protected: true, url: "https://github.com/example/user-service/tree/develop" },
    { name: "main", repository: "user-service", isDefault: false, protected: true, url: "https://github.com/example/user-service/tree/main" },
    { name: "feature/social-login", repository: "user-service", isDefault: false, protected: false, url: "https://github.com/example/user-service/tree/feature/social-login" },
    
    { name: "main", repository: "payment-service", isDefault: true, protected: true, url: "https://github.com/example/payment-service/tree/main" },
    { name: "develop", repository: "payment-service", isDefault: false, protected: false, url: "https://github.com/example/payment-service/tree/develop" },
    { name: "feature/stripe-v2", repository: "payment-service", isDefault: false, protected: false, url: "https://github.com/example/payment-service/tree/feature/stripe-v2" }
  ];
  await GithubBranch.insertMany(branches);

}

export async function syncGithubData() {

  try {
    if (ENV.GITHUB_USERNAME || ENV.GITHUB_TOKEN) {
      await syncRealGithubData();
    } else {
      await simulateGithubActivity();
    }
  } catch (error) {

  }
}

async function syncRealGithubData() {
  let username = ENV.GITHUB_USERNAME;
  let reposData = [];

  try {
    if (ENV.GITHUB_TOKEN) {
      const user = await fetchGithub("/user");
      username = user.login;

      // Paginated fetching for user repositories (both public & private, collaborator & organization)
      let page = 1;
      while (true) {
        const pageRepos = await fetchGithub(`/user/repos?per_page=100&page=${page}&sort=updated`);
        if (!pageRepos || pageRepos.length === 0) {
          break;
        }
        reposData = reposData.concat(pageRepos);
        if (pageRepos.length < 100) {
          break;
        }
        page++;
      }
    } else if (username) {
      // Paginated fetching for public repositories of specified user
      let page = 1;
      while (true) {
        const pageRepos = await fetchGithub(`/users/${username}/repos?per_page=100&page=${page}&sort=updated`);
        if (!pageRepos || pageRepos.length === 0) {
          break;
        }
        reposData = reposData.concat(pageRepos);
        if (pageRepos.length < 100) {
          break;
        }
        page++;
      }
    } else {
      return;
    }
  } catch (error) {
    console.error("❌ Error fetching repositories from GitHub:", error.message);
    return;
  }

  const fetchedRepos = [];
  const fetchedCommits = [];
  const fetchedPRs = [];
  const fetchedBranches = [];

  // Fetch details from the top 5 recently updated repositories to avoid rate limits
  const activeRepos = reposData.slice(0, 5);

  for (const repo of reposData) {
    const existingRepo = await GithubRepository.findOne({ name: repo.name });

    let branchesCount = existingRepo ? existingRepo.branchesCount : 1;
    let commitsCount = existingRepo ? existingRepo.commitsCount : 5;
    let pullsCount = existingRepo ? existingRepo.pullRequestsCount : 0;
    let lastCommitInfo = existingRepo ? existingRepo.lastCommit : null;

    const isActive = activeRepos.some(r => r.name === repo.name);

    if (isActive) {
      try {
        // Fetch branches using repo.owner.login instead of hardcoded username
        const branches = await fetchGithub(`/repos/${repo.owner.login}/${repo.name}/branches`);
        branchesCount = branches.length;

        for (const b of branches) {
          fetchedBranches.push({
            name: b.name,
            repository: repo.name,
            isDefault: b.name === repo.default_branch,
            protected: b.protected || false,
            url: `https://github.com/${repo.owner.login}/${repo.name}/tree/${b.name}`
          });
        }

        // Fetch commits using repo.owner.login
        const commits = await fetchGithub(`/repos/${repo.owner.login}/${repo.name}/commits?per_page=10`);
        commitsCount = commits.length; // Approximate from first page

        if (commits.length > 0) {
          const latest = commits[0];
          lastCommitInfo = {
            message: latest.commit.message,
            author: latest.commit.author.name,
            sha: latest.sha.substring(0, 7),
            timestamp: new Date(latest.commit.author.date)
          };

          // Collect commits for database
          for (const c of commits) {
            fetchedCommits.push({
              sha: c.sha.substring(0, 7),
              message: c.commit.message,
              author: c.commit.author.name,
              authorAvatar: c.author?.avatar_url || "",
              timestamp: new Date(c.commit.author.date),
              repository: repo.name,
              url: c.html_url
            });
          }
        }

        // Fetch Pull Requests using repo.owner.login
        const pulls = await fetchGithub(`/repos/${repo.owner.login}/${repo.name}/pulls?state=all&per_page=10`);
        pullsCount = pulls.length;

        for (const pr of pulls) {
          fetchedPRs.push({
            number: pr.number,
            title: pr.title,
            author: pr.user.login,
            status: pr.state === "open" ? "Open" : (pr.merged_at ? "Merged" : "Closed"),
            repository: repo.name,
            timestamp: new Date(pr.updated_at),
            url: pr.html_url
          });
        }
      } catch (err) {
        console.error(`⚠️ Error fetching details for repo ${repo.name}:`, err.message);
      }
    }

    fetchedRepos.push({
      name: repo.name,
      description: repo.description || "No description provided",
      visibility: repo.private ? "Private" : "Public",
      defaultBranch: repo.default_branch,
      lastCommit: lastCommitInfo || {
        message: "Initial commit",
        author: repo.owner.login,
        sha: "0000000",
        timestamp: new Date(repo.created_at)
      },
      updated: new Date(repo.updated_at),
      branchesCount,
      commitsCount,
      pullRequestsCount: pullsCount,
      status: "Synced",
      group: repo.fork ? "Forks" : (repo.archived ? "Archived" : "Backend"),
      url: repo.html_url
    });
  }

  // Detect and log changes
  let changesDetected = false;

  // Clean up mock/stale repositories, commits, pull requests, and branches that are not in the real GitHub response.
  const fetchedNames = fetchedRepos.map(r => r.name);
  const deleteReposResult = await GithubRepository.deleteMany({ name: { $nin: fetchedNames } });
  if (deleteReposResult.deletedCount > 0) {
    changesDetected = true;
  }
  await GithubCommit.deleteMany({ repository: { $nin: fetchedNames } });
  await GithubPullRequest.deleteMany({ repository: { $nin: fetchedNames } });
  await GithubBranch.deleteMany({ repository: { $nin: fetchedNames } });

  // 1. Process Repositories
  for (const newRepo of fetchedRepos) {
    const existing = await GithubRepository.findOne({ name: newRepo.name });
    if (!existing) {
      await GithubRepository.create(newRepo);
      changesDetected = true;
    } else {
      // Check if last commit is different
      if (existing.lastCommit.sha !== newRepo.lastCommit.sha || existing.commitsCount !== newRepo.commitsCount) {
        await GithubRepository.updateOne({ name: newRepo.name }, newRepo);
        changesDetected = true;
      }
    }
  }

  // 2. Process Commits
  for (const c of fetchedCommits) {
    const existing = await GithubCommit.findOne({ sha: c.sha });
    if (!existing) {
      await GithubCommit.create(c);
      changesDetected = true;
    }
  }

  // 3. Process PRs
  for (const pr of fetchedPRs) {
    const existing = await GithubPullRequest.findOne({ number: pr.number, repository: pr.repository });
    if (!existing) {
      await GithubPullRequest.create(pr);
      changesDetected = true;
    } else if (existing.status !== pr.status) {
      await GithubPullRequest.updateOne({ number: pr.number, repository: pr.repository }, { status: pr.status, timestamp: pr.timestamp });
      changesDetected = true;
    }
  }

  // 4. Process Branches
  for (const b of fetchedBranches) {
    const existing = await GithubBranch.findOne({ name: b.name, repository: b.repository });
    if (!existing) {
      await GithubBranch.create(b);
      changesDetected = true;
    } else if (existing.protected !== b.protected || existing.isDefault !== b.isDefault) {
      await GithubBranch.updateOne({ name: b.name, repository: b.repository }, { protected: b.protected, isDefault: b.isDefault });
      changesDetected = true;
    }
  }

  // 5. Update Dashboard metrics
  if (changesDetected || !(await GithubDashboard.findOne())) {
    const totalRepos = reposData.length;
    const forksCount = reposData.filter(r => r.fork).length;
    const archivedCount = reposData.filter(r => r.archived).length;

    const allBranchesCount = fetchedRepos.reduce((sum, r) => sum + r.branchesCount, 0);
    const allCommitsCount = fetchedRepos.reduce((sum, r) => sum + r.commitsCount, 0);
    const allPullRequestsCount = fetchedRepos.reduce((sum, r) => sum + r.pullRequestsCount, 0);

    const dbDashboard = await GithubDashboard.findOne();
    const updatedDashboardData = {
      totalRepositories: totalRepos,
      totalRepositoriesTrend: dbDashboard ? Number(((totalRepos - dbDashboard.totalRepositories) / (dbDashboard.totalRepositories || 1) * 100).toFixed(1)) : 0,
      totalBranches: allBranchesCount,
      totalCommits: allCommitsCount,
      pullRequests: allPullRequestsCount,
      repositoryHealth: {
        healthy: reposData.filter(r => !r.archived && !r.disabled).length,
        warning: archivedCount,
        error: 0,
        total: totalRepos
      },
      pullRequestsOverview: {
        open: fetchedPRs.filter(p => p.status === "Open").length,
        merged: fetchedPRs.filter(p => p.status === "Merged").length,
        closed: fetchedPRs.filter(p => p.status === "Closed").length,
        total: fetchedPRs.length
      }
    };

    if (dbDashboard) {
      // Append sparklines
      const pushSparkline = (arr, val) => {
        const next = [...arr, val];
        if (next.length > 10) next.shift();
        return next;
      };
      updatedDashboardData.totalRepositoriesSparkline = pushSparkline(dbDashboard.totalRepositoriesSparkline, totalRepos);
      updatedDashboardData.totalBranchesSparkline = pushSparkline(dbDashboard.totalBranchesSparkline, updatedDashboardData.totalBranches);
      updatedDashboardData.totalCommitsSparkline = pushSparkline(dbDashboard.totalCommitsSparkline, updatedDashboardData.totalCommits);
      updatedDashboardData.pullRequestsSparkline = pushSparkline(dbDashboard.pullRequestsSparkline, updatedDashboardData.pullRequests);

      await GithubDashboard.updateOne({}, updatedDashboardData);
    } else {
      updatedDashboardData.totalRepositoriesSparkline = [totalRepos];
      updatedDashboardData.totalBranchesSparkline = [updatedDashboardData.totalBranches];
      updatedDashboardData.totalCommitsSparkline = [updatedDashboardData.totalCommits];
      updatedDashboardData.pullRequestsSparkline = [updatedDashboardData.pullRequests];
      await GithubDashboard.create(updatedDashboardData);
    }
  }
}

async function simulateGithubActivity() {

  const repos = await GithubRepository.find();
  if (repos.length === 0) {
    await seedInitialData();
    return;
  }

  // 30% chance to simulate a new commit or pull request change
  const shouldChange = Math.random() < 0.7; // set high for testing, so changes show up easily
  if (!shouldChange) {
    return;
  }

  const randomRepo = repos[Math.floor(Math.random() * repos.length)];
  const activityType = Math.random() < 0.6 ? "COMMIT" : "PULL_REQUEST";

  const authors = ["john.doe", "mike.dev", "janedoe", "david.dev", "sarah.wilson", "11m2n3s"];
  const selectedAuthor = authors[Math.floor(Math.random() * authors.length)];

  if (activityType === "COMMIT") {
    // Create simulated commit
    const commitMsgs = [
      "feat: optimize database indexing for payment transactions",
      "fix: correct order history sorting on dashboard",
      "refactor: extract checkout form components",
      "chore: bump vite packages to latest security releases",
      "docs: expand api gateway swagger spec definitions",
      "test: add unit specs for role validation helpers"
    ];
    const message = commitMsgs[Math.floor(Math.random() * commitMsgs.length)];
    const sha = Math.random().toString(36).substring(2, 9);

    const newCommit = new GithubCommit({
      sha,
      message,
      author: selectedAuthor,
      authorAvatar: "",
      timestamp: new Date(),
      repository: randomRepo.name,
      url: `https://github.com/example/${randomRepo.name}/commit/${sha}`
    });

    await newCommit.save();

    // Update Repository info
    const updatedRepo = await GithubRepository.findOneAndUpdate(
      { name: randomRepo.name },
      {
        $inc: { commitsCount: 1 },
        $set: {
          lastCommit: {
            message,
            author: selectedAuthor,
            sha,
            timestamp: new Date()
          },
          updated: new Date(),
          status: "Synced"
        }
      },
      { returnDocument: "after" }
    );

    // Update Dashboard counts
    const dashboard = await GithubDashboard.findOne();
    if (dashboard) {
      const nextCommits = dashboard.totalCommits + 1;
      const pushSparkline = (arr, val) => {
        const next = [...arr, val];
        if (next.length > 10) next.shift();
        return next;
      };

      await GithubDashboard.updateOne(
        {},
        {
          $inc: { totalCommits: 1 },
          $set: {
            totalCommitsSparkline: pushSparkline(dashboard.totalCommitsSparkline, nextCommits),
            totalCommitsTrend: Number((dashboard.totalCommitsTrend + 0.1).toFixed(1))
          }
        }
      );
    }


  } else {
    // Create or update a pull request
    const prAction = Math.random() < 0.5 ? "NEW" : "MERGE";

    if (prAction === "NEW") {
      const prNumber = Math.floor(Math.random() * 500) + 130;
      const prTitles = [
        "Feature: integrate search filters for products catalog",
        "Bugfix: repair token expiration handler refresh trigger",
        "Refactoring: align cart pricing state machine logic",
        "Config: upgrade eslint plugins config options"
      ];
      const title = prTitles[Math.floor(Math.random() * prTitles.length)];

      const newPR = new GithubPullRequest({
        number: prNumber,
        title,
        author: selectedAuthor,
        status: "Open",
        repository: randomRepo.name,
        timestamp: new Date(),
        url: `https://github.com/example/${randomRepo.name}/pull/${prNumber}`
      });

      await newPR.save();

      // Update repo pull request count
      await GithubRepository.updateOne(
        { name: randomRepo.name },
        { $inc: { pullRequestsCount: 1 }, $set: { updated: new Date() } }
      );

      // Update Dashboard
      const dashboard = await GithubDashboard.findOne();
      if (dashboard) {
        const nextPRs = dashboard.pullRequests + 1;
        const pushSparkline = (arr, val) => {
          const next = [...arr, val];
          if (next.length > 10) next.shift();
          return next;
        };

        await GithubDashboard.updateOne(
          {},
          {
            $inc: {
              pullRequests: 1,
              "pullRequestsOverview.open": 1,
              "pullRequestsOverview.total": 1
            },
            $set: {
              pullRequestsSparkline: pushSparkline(dashboard.pullRequestsSparkline, nextPRs)
            }
          }
        );
      }


    } else {
      // Find an open PR to merge
      const openPR = await GithubPullRequest.findOne({ status: "Open" });
      if (openPR) {
        await GithubPullRequest.updateOne(
          { _id: openPR._id },
          { $set: { status: "Merged", timestamp: new Date() } }
        );

        // Update Dashboard
        await GithubDashboard.updateOne(
          {},
          {
            $inc: {
              "pullRequestsOverview.open": -1,
              "pullRequestsOverview.merged": 1
            }
          }
        );
      }
    }
  }
}

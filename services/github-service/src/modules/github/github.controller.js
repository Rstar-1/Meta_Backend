import { models, utils } from "../../../../../shared/index.js";
import { syncGithubData } from "./github.service.js";

const { GithubDashboard, GithubRepository, GithubCommit, GithubPullRequest, GithubBranch } = models;
const { asyncHandler, successResponse } = utils;

/**
 * Manually trigger GitHub synchronization
 */
export const syncGithub = asyncHandler(async (req, res) => {
  await syncGithubData();
  return successResponse(res, null, "GitHub synchronization completed successfully");
});

/**
 * Get GitHub dashboard metrics and analytics
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await GithubDashboard.findOne();
  return successResponse(res, dashboard, "GitHub dashboard data fetched successfully");
});

/**
 * Get list of GitHub repositories with filters (group, status, etc.)
 */
export const getRepositories = asyncHandler(async (req, res) => {
  const { group, search } = req.query;
  const filter = {};

  if (group && group !== "All Repositories" && group !== "All Groups") {
    // Check if group matches one of repository groups, otherwise map custom ones if needed
    filter.group = group;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const repositories = await GithubRepository.find(filter).sort({ updated: -1 });
  return successResponse(res, repositories, "GitHub repositories fetched successfully");
});

/**
 * Get branches with filters (repository)
 */
export const getBranches = asyncHandler(async (req, res) => {
  const { repository } = req.query;
  const filter = {};

  if (repository) {
    filter.repository = repository;
  }

  const branches = await GithubBranch.find(filter).sort({ name: 1 });
  return successResponse(res, branches, "GitHub branches fetched successfully");
});

/**
 * Get recent commits
 */
export const getCommits = asyncHandler(async (req, res) => {
  const { repository, limit = 10 } = req.query;
  const filter = {};

  if (repository) {
    filter.repository = repository;
  }

  const commits = await GithubCommit.find(filter)
    .sort({ timestamp: -1 })
    .limit(Number(limit));

  return successResponse(res, commits, "GitHub commits fetched successfully");
});

/**
 * Get recent pull requests
 */
export const getPullRequests = asyncHandler(async (req, res) => {
  const { repository, status, limit = 10 } = req.query;
  const filter = {};

  if (repository) {
    filter.repository = repository;
  }

  if (status) {
    filter.status = status;
  }

  const pullRequests = await GithubPullRequest.find(filter)
    .sort({ timestamp: -1 })
    .limit(Number(limit));

  return successResponse(res, pullRequests, "GitHub pull requests fetched successfully");
});

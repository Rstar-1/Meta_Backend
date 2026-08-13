import * as dashboardService from "./dashboard.service.js";
import { utils } from "../../../../../shared/index.js";

const { successResponse, asyncHandler } = utils;

export const getTotalLeads = asyncHandler(async (req, res) => {
  const result = await dashboardService.getTotalLeads(req.user);
  return successResponse(res, result, "Total leads count fetched successfully");
});

export const getWeeklyEarnings = asyncHandler(async (req, res) => {
  const result = await dashboardService.getWeeklyEarnings(req.user);
  return successResponse(res, result, "Weekly earnings overview fetched successfully");
});

export const getWeeklyLeads = asyncHandler(async (req, res) => {
  const result = await dashboardService.getWeeklyLeads(req.user);
  return successResponse(res, result, "Weekly leads chart data fetched successfully");
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const result = await dashboardService.getTopProducts(limit, req.user);
  return successResponse(res, result, "Top products fetched successfully");
});

export const getYearlyRevenue = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const result = await dashboardService.getYearlyRevenue(year, req.user);
  return successResponse(res, result, "Yearly revenue insights fetched successfully");
});

export const getBestSeller = asyncHandler(async (req, res) => {
  const result = await dashboardService.getBestSeller(req.user);
  return successResponse(res, result, "Best seller of the month fetched successfully");
});

export const getOrderStatusStats = asyncHandler(async (req, res) => {
  const result = await dashboardService.getOrderStatusStats(req.user);
  return successResponse(res, result, "Order status stats fetched successfully");
});

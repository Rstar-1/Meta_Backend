import * as service from "./category.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

export const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await service.getBlogCategories();
  return successResponse(res, categories, "Blog categories fetched successfully.");
});

export const getBlogCategoryById = asyncHandler(async (req, res) => {
  const category = await service.getBlogCategoryById(req.params.id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Blog category not found.",
    });
  }
  return successResponse(res, category, "Blog category fetched successfully.");
});

export const createBlogCategory = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    createdBy: req.user ? req.user.id : undefined,
  };
  const category = await service.createBlogCategory(data);
  return successResponse(res, category, "Blog category created successfully.", 201);
});

export const updateBlogCategory = asyncHandler(async (req, res) => {
  const category = await service.updateBlogCategory(req.params.id, req.body);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Blog category not found.",
    });
  }
  return successResponse(res, category, "Blog category updated successfully.");
});

export const deleteBlogCategory = asyncHandler(async (req, res) => {
  const category = await service.deleteBlogCategory(req.params.id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Blog category not found.",
    });
  }
  return successResponse(res, null, "Blog category deleted successfully.");
});

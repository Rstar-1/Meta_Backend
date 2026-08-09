import * as service from "./blog.service.js";
import { getBlogCategories } from "../categories/category.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

export const getBlogs = asyncHandler(async (req, res) => {
  const data = await service.getBlogs(req.query);
  return successResponse(res, data, "Blogs fetched successfully.");
});

export const getBlogCategoriesWithCounts = asyncHandler(async (req, res) => {
  const categories = await getBlogCategories();
  return successResponse(res, categories, "Blog categories fetched successfully.");
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await service.getBlogBySlug(req.params.slug);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }
  return successResponse(res, blog, "Blog fetched successfully.");
});

export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await service.getBlogById(req.params.id);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }
  return successResponse(res, blog, "Blog fetched successfully.");
});

export const createBlog = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    createdBy: req.user ? req.user.id : undefined,
  };
  const blog = await service.createBlog(data);
  return successResponse(res, blog, "Blog post created successfully.", 201);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await service.updateBlog(req.params.id, req.body);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }
  return successResponse(res, blog, "Blog post updated successfully.");
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await service.deleteBlog(req.params.id);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }
  return successResponse(res, null, "Blog post deleted successfully.");
});

export const addReview = asyncHandler(async (req, res) => {
  const blog = await service.addReview(req.params.id, req.user.id, req.body);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found.",
    });
  }
  return successResponse(res, blog, "Review added successfully.", 201);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const blog = await service.deleteReview(req.params.id, req.params.reviewId, req.user.id);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post or review not found.",
    });
  }
  return successResponse(res, blog, "Review deleted successfully.");
});


import * as service from "./category.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

const formatCategoryIcon = (category, req) => {
  if (category && category.icon && (category.icon.startsWith("/uploads/") || category.icon.startsWith("uploads/"))) {
    const cleanPath = category.icon.startsWith("/") ? category.icon : `/${category.icon}`;
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"] || req.get("host");
    category.icon = `${protocol}://${host}${cleanPath}`;
  }
  return category;
};

export const createCategory = asyncHandler(async (req, res) => {
  const data = { 
    ...req.body, 
    createdBy: req.user.id
  };
  if (req.file) {
    data.icon = `/uploads/${req.file.filename}`;
  }
  const category = await service.createCategory(data);
  const doc = category.toObject ? category.toObject() : category;
  formatCategoryIcon(doc, req);
  return successResponse(res, doc, "Category created", 201);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await service.getCategories(req.query);
  const formatted = categories.map(cat => {
    const doc = cat.toObject ? cat.toObject() : cat;
    return formatCategoryIcon(doc, req);
  });
  return successResponse(res, formatted, "Categories fetched");
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await service.getCategoryById(req.params.id);
  if (category) {
    const doc = category.toObject ? category.toObject() : category;
    formatCategoryIcon(doc, req);
    return successResponse(res, doc, "Category fetched");
  }
  return successResponse(res, null, "Category not found");
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    data.icon = `/uploads/${req.file.filename}`;
  }
  const category = await service.updateCategory(req.params.id, data);
  if (category) {
    const doc = category.toObject ? category.toObject() : category;
    formatCategoryIcon(doc, req);
    return successResponse(res, doc, "Category updated");
  }
  return successResponse(res, null, "Category not found");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await service.deleteCategory(req.params.id);
  return successResponse(res, null, "Category deleted");
});

export const seedCategories = asyncHandler(async (req, res) => {
  const count = await service.seedCategories(req.user.id);
  return successResponse(res, { seededCount: count }, "Categories seeded successfully");
});

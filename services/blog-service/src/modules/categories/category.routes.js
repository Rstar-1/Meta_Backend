import express from "express";
import {
  getBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "./category.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware, checkPermission } = middleware;

const router = express.Router();

router.get("/", getBlogCategories);
router.get("/:id", getBlogCategoryById);

router.post(
  "/",
  authMiddleware,
  checkPermission("BLOG_CATEGORY_CREATE"),
  createBlogCategory
);

router.put(
  "/:id",
  authMiddleware,
  checkPermission("BLOG_CATEGORY_UPDATE"),
  updateBlogCategory
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("BLOG_CATEGORY_DELETE"),
  deleteBlogCategory
);

export default router;

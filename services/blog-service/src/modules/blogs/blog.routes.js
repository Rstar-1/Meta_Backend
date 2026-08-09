import express from "express";
import {
  getBlogs,
  getBlogCategoriesWithCounts,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addReview,
  deleteReview,
} from "./blog.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware, checkPermission } = middleware;

const router = express.Router();

router.get("/", getBlogs);
router.get("/categories", getBlogCategoriesWithCounts);
router.get("/slug/:slug", getBlogBySlug);
router.get("/:id", getBlogById);


router.post(
  "/:id/reviews",
  authMiddleware,
  addReview
);

router.delete(
  "/:id/reviews/:reviewId",
  authMiddleware,
  deleteReview
);

router.post(
  "/",
  authMiddleware,
  checkPermission("BLOG_CREATE"),
  createBlog
);

router.put(
  "/:id",
  authMiddleware,
  checkPermission("BLOG_UPDATE"),
  updateBlog
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("BLOG_DELETE"),
  deleteBlog
);

export default router;

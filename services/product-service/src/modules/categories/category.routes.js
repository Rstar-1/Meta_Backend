import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  seedCategories,
} from "./category.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware, checkPermission, upload, uploadErrorHandler } = middleware;

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post(
  "/seed",
  authMiddleware,
  checkPermission("CATEGORY_CREATE"),
  seedCategories
);

router.post(
  "/",
  authMiddleware,
  checkPermission("CATEGORY_CREATE"),
  upload.single("icon"),
  uploadErrorHandler,
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  checkPermission("CATEGORY_UPDATE"),
  upload.single("icon"),
  uploadErrorHandler,
  updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("CATEGORY_DELETE"),
  deleteCategory
);

export default router;

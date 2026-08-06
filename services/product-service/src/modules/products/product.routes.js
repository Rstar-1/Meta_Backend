import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
} from "./product.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware, checkPermission } = middleware;

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/:id/reviews",
  authMiddleware,
  createProductReview
);

router.post(
  "/",
  authMiddleware,
  checkPermission("PRODUCT_CREATE"),
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  checkPermission("PRODUCT_UPDATE"),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("PRODUCT_DELETE"),
  deleteProduct
);

export default router;

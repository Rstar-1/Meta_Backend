import express from "express";
import productRoutes from "../modules/products/product.routes.js";
import categoryRoutes from "../modules/categories/category.routes.js";

const router = express.Router();

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);

export default router;

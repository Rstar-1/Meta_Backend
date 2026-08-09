import express from "express";
import blogRoutes from "../modules/blogs/blog.routes.js";
import categoryRoutes from "../modules/categories/category.routes.js";

const router = express.Router();

router.use("/blogs", blogRoutes);
router.use("/blog-categories", categoryRoutes);

export default router;

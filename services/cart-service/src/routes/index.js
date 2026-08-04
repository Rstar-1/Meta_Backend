import express from "express";
import cartRoutes from "../modules/cart/cart.routes.js";

const router = express.Router();

router.use("/cart", cartRoutes);

export default router;

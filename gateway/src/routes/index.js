import express from "express";
import { 
  authProxy, 
  userProxy, 
  productProxy, 
  cartProxy, 
  orderProxy, 
  paymentProxy,
  roleProxy,
  seoProxy,
  leadProxy,
  blogProxy,
  cmsProxy,
  dashboardProxy,
  analyticProxy
} from "../proxies/index.js";
import healthRoutes from "./health.routes.js";

const router = express.Router();

router.use(authProxy);
router.use(userProxy);
router.use(productProxy);
router.use(cartProxy);
router.use(orderProxy);
router.use(paymentProxy);
router.use(roleProxy);
router.use(seoProxy);
router.use(leadProxy);
router.use(blogProxy);
router.use(cmsProxy);
router.use(dashboardProxy);
router.use(analyticProxy);
router.use("/healthgateway", healthRoutes);

export default router;
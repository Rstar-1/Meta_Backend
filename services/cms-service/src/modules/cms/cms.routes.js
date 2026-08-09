import express from "express";
import { middleware } from "../../../../../shared/index.js";
import {
  getCmsSections,
  getCmsSectionById,
  createCmsSection,
  updateCmsSection,
  deleteCmsSection,
} from "./cms.controller.js";

const { authMiddleware, checkPermission } = middleware;
const router = express.Router();

router.get("/", getCmsSections);
router.get("/:id", getCmsSectionById);

router.post(
  "/",
  authMiddleware,
  checkPermission("CMS_CREATE"),
  createCmsSection
);

router.put(
  "/:id",
  authMiddleware,
  checkPermission("CMS_UPDATE"),
  updateCmsSection
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("CMS_DELETE"),
  deleteCmsSection
);

export default router;

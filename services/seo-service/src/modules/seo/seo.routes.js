import express from "express";
import {
  getSEORecords,
  getSEORecordByRoute,
  getSEORecordById,
  createSEORecord,
  updateSEORecord,
  deleteSEORecord
} from "./seo.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware, checkPermission } = middleware;

const router = express.Router();

router.get("/", getSEORecords);
router.get("/route", getSEORecordByRoute);
router.get("/:id", getSEORecordById);

router.post(
  "/",
  authMiddleware,
  checkPermission("SEO_CREATE"),
  createSEORecord
);

router.put(
  "/:id",
  authMiddleware,
  checkPermission("SEO_UPDATE"),
  updateSEORecord
);

router.delete(
  "/:id",
  authMiddleware,
  checkPermission("SEO_DELETE"),
  deleteSEORecord
);

export default router;

import express from "express";
import {
  getUsers,
  getProfile,
  updateUser,
  uploadDocuments,
} from "./user.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware, upload, uploadErrorHandler, checkPermission } = middleware;

const router = express.Router();

const canUpdateUser = (req, res, next) => {
  if (req.user && req.user.id === req.params.id) {
    return next();
  }
  return checkPermission("USER_UPDATE")(req, res, next);
};

/* ================= USERS ================= */

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.get(
  "/",
  authMiddleware,
  checkPermission("USER_VIEW"),
  getUsers
);

router.put(
  "/:id",
  authMiddleware,
  canUpdateUser,
  updateUser
);

/* ================= UPLOAD ================= */

router.post(
  "/upload-documents",
  authMiddleware,
  upload.fields([
    { name: "gstCertificate", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "shopPhoto", maxCount: 1 },
  ]),
  uploadErrorHandler,
  uploadDocuments
);

export default router;

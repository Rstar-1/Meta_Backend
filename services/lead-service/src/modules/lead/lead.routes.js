import express from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} from "./lead.controller.js";

import { middleware } from "../../../../../shared/index.js";
const { authMiddleware } = middleware;

const router = express.Router();

router.get("/", authMiddleware, getLeads);
router.get("/:id", authMiddleware, getLeadById);
router.post("/", authMiddleware, createLead);
router.put("/:id", authMiddleware, updateLead);
router.delete("/:id", authMiddleware, deleteLead);

export default router;

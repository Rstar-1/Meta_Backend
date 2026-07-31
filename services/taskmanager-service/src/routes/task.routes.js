import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../modules/tasks/task.controller.js";

import { middleware } from "../../../../shared/index.js";
const { authMiddleware } = middleware;

const router = express.Router();

// Define stats route before /:id to prevent matching conflict
router.get("/stats", getTaskStats);

router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;

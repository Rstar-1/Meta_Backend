import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../modules/notes/note.controller.js";

import { middleware } from "../../../../shared/index.js";
const { authMiddleware } = middleware;

const router = express.Router();

router.get("/", getNotes);
router.get("/:id", getNoteById);

router.post("/", authMiddleware, createNote);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

export default router;

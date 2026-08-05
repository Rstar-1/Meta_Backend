import express from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "./role.controller.js";

import { middleware, constants } from "../../../../../shared/index.js";
const { checkPermission } = middleware;
const { roles } = constants;

const router = express.Router();

// CREATE
router.post("/", checkPermission(roles.ADMIN), createRole);

// READ ALL
router.get("/", getRoles);

// READ ONE
router.get("/:id", getRoleById);

// UPDATE
router.put("/:id", checkPermission(roles.ADMIN), updateRole);

// DELETE
router.delete("/:id", checkPermission(roles.ADMIN), deleteRole);

export default router;

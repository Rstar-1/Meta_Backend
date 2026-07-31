import * as service from "./task.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

export const createTask = asyncHandler(async (req, res) => {
  if (req.user?.role !== "admin") {
    delete req.body.assignTo;
  }
  const data = {
    ...req.body,
    createdBy: req.user?.id,
  };
  const task = await service.createTask(data);
  return successResponse(res, task, "Task created", 201);
});

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await service.getTasks(req.query, req.user);
  return successResponse(res, tasks, "Tasks fetched");
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await service.getTaskById(req.params.id, req.user);
  return successResponse(res, task, "Task fetched");
});

export const updateTask = asyncHandler(async (req, res) => {
  if (req.user?.role !== "admin") {
    delete req.body.assignTo;
  }
  const task = await service.updateTask(req.params.id, req.body, req.user);
  return successResponse(res, task, "Task updated");
});

export const deleteTask = asyncHandler(async (req, res) => {
  await service.deleteTask(req.params.id, req.user);
  return successResponse(res, null, "Task deleted");
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await service.getTaskStats(req.query, req.user);
  return successResponse(res, stats, "Task stats fetched");
});

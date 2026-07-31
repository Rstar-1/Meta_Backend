import * as service from "./note.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

export const createNote = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    createdBy: req.user?.id,
  };
  const note = await service.createNote(data);
  return successResponse(res, note, "Note created", 201);
});

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await service.getNotes(req.query);
  return successResponse(res, notes, "Notes fetched");
});

export const getNoteById = asyncHandler(async (req, res) => {
  const note = await service.getNoteById(req.params.id);
  return successResponse(res, note, "Note fetched");
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await service.updateNote(req.params.id, req.body);
  return successResponse(res, note, "Note updated");
});

export const deleteNote = asyncHandler(async (req, res) => {
  await service.deleteNote(req.params.id);
  return successResponse(res, null, "Note deleted");
});

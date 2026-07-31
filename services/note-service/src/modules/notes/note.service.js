import { models } from "../../../../../shared/index.js";
const { Note } = models;

export const createNote = async (data) => {
  const note = await Note.create(data);
  return note;
};

export const getNotes = async (query = {}) => {
  const { type, createdBy, search } = query;
  const filter = { isDeleted: false };

  if (type) filter.type = type;
  if (createdBy) filter.createdBy = createdBy;
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const notes = await Note.find(filter)
    .populate("createdBy", "fullname email")
    .sort({ createdAt: -1 });

  return notes;
};

export const getNoteById = async (id) => {
  const note = await Note.findOne({ _id: id, isDeleted: false })
    .populate("createdBy", "fullname email");

  if (!note) throw new Error("Note not found");
  return note;
};

export const updateNote = async (id, data) => {
  const note = await Note.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true }
  );

  if (!note) throw new Error("Note not found");
  return note;
};

export const deleteNote = async (id) => {
  const note = await Note.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!note) throw new Error("Note not found");
  return { success: true, message: "Note deleted successfully" };
};

import { models } from "../../../../../shared/index.js";
const { Task } = models;

export const createTask = async (data) => {
  const task = await Task.create(data);
  return task;
};

export const getTasks = async (query = {}, user = {}) => {
  const { project, assignee, priority, status, search, assignTo } = query;
  const filter = { isDeleted: false };

  // Enforce task assignment visibility: non-admins only see tasks assigned to them
  if (user.role !== "admin") {
    filter.assignTo = user.id;
  } else {
    if (assignTo) filter.assignTo = assignTo;
  }

  if (project) filter.project = project;
  if (assignee) filter.assignee = assignee;
  if (priority) filter.priority = priority;
  if (status) filter.status = status;
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const tasks = await Task.find(filter)
    .populate("assignTo", "fullname email image")
    .populate("createdBy", "fullname email")
    .sort({ createdAt: -1 });

  return tasks;
};

export const getTaskById = async (id, user = {}) => {
  const task = await Task.findOne({ _id: id, isDeleted: false })
    .populate("assignTo", "fullname email image")
    .populate("createdBy", "fullname email");

  if (!task) throw new Error("Task not found");

  if (user.role !== "admin" && task.assignTo?.toString() !== user.id) {
    throw new Error("Access denied. You are not assigned to this task.");
  }

  return task;
};

export const updateTask = async (id, data, user = {}) => {
  const existingTask = await Task.findOne({ _id: id, isDeleted: false });
  if (!existingTask) throw new Error("Task not found");

  if (user.role !== "admin" && existingTask.assignTo?.toString() !== user.id) {
    throw new Error("Access denied. You can only update tasks assigned to you.");
  }

  const task = await Task.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true }
  ).populate("assignTo", "fullname email image");

  return task;
};

export const deleteTask = async (id, user = {}) => {
  const existingTask = await Task.findOne({ _id: id, isDeleted: false });
  if (!existingTask) throw new Error("Task not found");

  if (user.role !== "admin") {
    throw new Error("Access denied. Only administrators can delete tasks.");
  }

  await Task.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  return { success: true, message: "Task deleted successfully" };
};

export const getTaskStats = async (query = {}, user = {}) => {
  const filter = { isDeleted: false };
  
  if (user.role !== "admin") {
    filter.assignTo = user.id;
  } else {
    if (query.assignTo) {
      filter.assignTo = query.assignTo;
    }
  }

  if (query.project) {
    filter.project = query.project;
  }

  const tasks = await Task.find(filter);

  const stats = {
    total: tasks.length,
    completed: 0,
    inProgress: 0,
    toDo: 0,
    overdue: 0,
  };

  tasks.forEach((task) => {
    if (task.status === "Completed") stats.completed++;
    else if (task.status === "In Progress") stats.inProgress++;
    else if (task.status === "To Do") stats.toDo++;
    else if (task.status === "Overdue") stats.overdue++;
  });

  return stats;
};

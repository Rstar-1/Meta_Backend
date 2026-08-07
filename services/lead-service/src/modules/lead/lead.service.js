import { models } from "../../../../../shared/index.js";
const { Lead, User } = models;
import mongoose from "mongoose";

/**
 * Get leads with optional filter & search
 */
export const getLeads = async (query = {}) => {
  const filter = { isDeleted: false };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    const orConditions = [
      { id: searchRegex },
      { company: searchRegex },
      { mobile: searchRegex },
      { email: searchRegex },
      { location: searchRegex },
      { enquiry: searchRegex },
    ];
    if (mongoose.Types.ObjectId.isValid(query.search)) {
      orConditions.push({ createdBy: query.search });
    }
    filter.$or = orConditions;
  }

  // Sort by newest leads first
  return await Lead.find(filter).sort({ createdAt: -1 });
};

/**
 * Get lead by id (supports both MongoDB ObjectId and unique ENQ-XXXX ID)
 */
export const getLeadById = async (id) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id, isDeleted: false }
    : { id: id, isDeleted: false };
  return await Lead.findOne(query);
};

/**
 * Create a new lead
 */
export const createLead = async (data, userToken = null) => {
  let createdBy = data.createdBy;

  // 1. If explicit createdBy provided and it is a valid ObjectId, use it
  if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
    // Already valid ObjectId
  } 
  // 2. If explicit createdBy is a string (e.g. email or mobile), look up User in DB
  else if (createdBy && typeof createdBy === "string") {
    const user = await User.findOne({
      $or: [{ email: createdBy.toLowerCase() }, { mobile: createdBy }]
    });
    if (user) {
      createdBy = user._id;
    } else {
      createdBy = null;
    }
  }

  // 3. Fallback to authenticated user token ID if createdBy is not set or couldn't be resolved
  if (!createdBy && userToken) {
    const userId = userToken.id || userToken._id;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      createdBy = userId;
    }
  }

  // 4. Fallback to any existing user in DB if still missing
  if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
    const defaultUser = await User.findOne({});
    if (defaultUser) {
      createdBy = defaultUser._id;
    } else {
      throw new Error("User ID (createdBy) is required to create a lead.");
    }
  }

  return await Lead.create({
    ...data,
    createdBy,
  });
};

/**
 * Update an existing lead (supports both MongoDB ObjectId and unique ENQ-XXXX ID)
 */
export const updateLead = async (id, data) => {
  const updateData = { ...data };
  if (updateData.createdBy && !mongoose.Types.ObjectId.isValid(updateData.createdBy)) {
    delete updateData.createdBy;
  }

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id, isDeleted: false }
    : { id: id, isDeleted: false };
  return await Lead.findOneAndUpdate(
    query,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete a lead (supports both MongoDB ObjectId and unique ENQ-XXXX ID)
 */
export const deleteLead = async (id) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id, isDeleted: false }
    : { id: id, isDeleted: false };
  return await Lead.findOneAndUpdate(
    query,
    { $set: { isDeleted: true } },
    { new: true }
  );
};

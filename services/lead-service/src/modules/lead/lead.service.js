import { models } from "../../../../../shared/index.js";
const { Lead } = models;
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
    filter.$or = [
      { id: searchRegex },
      { company: searchRegex },
      { mobile: searchRegex },
      { email: searchRegex },
      { location: searchRegex },
      { enquiry: searchRegex },
      { createdBy: searchRegex },
    ];
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
export const createLead = async (data) => {
  return await Lead.create(data);
};

/**
 * Update an existing lead (supports both MongoDB ObjectId and unique ENQ-XXXX ID)
 */
export const updateLead = async (id, data) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id, isDeleted: false }
    : { id: id, isDeleted: false };
  return await Lead.findOneAndUpdate(
    query,
    { $set: data },
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

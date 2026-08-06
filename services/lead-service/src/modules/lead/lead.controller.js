import * as service from "./lead.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

export const getLeads = asyncHandler(async (req, res) => {
  const leads = await service.getLeads(req.query);
  return successResponse(res, leads, "Leads fetched successfully.");
});

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await service.getLeadById(req.params.id);
  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found.",
    });
  }
  return successResponse(res, lead, "Lead fetched successfully.");
});

export const createLead = asyncHandler(async (req, res) => {
  // If the user specifies `createdBy` in the body, use it. Otherwise fall back to req.user.name or name from token
  const data = {
    ...req.body,
    createdBy: req.body.createdBy || (req.user ? req.user.name || req.user.email : "System")
  };
  const lead = await service.createLead(data);
  return successResponse(res, lead, "Lead created successfully.", 201);
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await service.updateLead(req.params.id, req.body);
  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found.",
    });
  }
  return successResponse(res, lead, "Lead updated successfully.");
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await service.deleteLead(req.params.id);
  if (!lead) {
    return res.status(404).json({
      success: false,
      message: "Lead not found.",
    });
  }
  return successResponse(res, null, "Lead deleted successfully.");
});

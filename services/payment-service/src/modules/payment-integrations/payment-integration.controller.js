import * as integrationService from "./payment-integration.service.js";
import { utils } from "../../../../../shared/index.js";

const { successResponse, asyncHandler } = utils;

export const createIntegration = asyncHandler(async (req, res) => {
  const integration = await integrationService.createIntegration(req.body);
  return successResponse(res, integration, "Payment integration created successfully", 201);
});

export const getAllIntegrations = asyncHandler(async (req, res) => {
  const integrations = await integrationService.getAllIntegrations();
  return successResponse(res, integrations, "Payment integrations fetched successfully");
});

export const getIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const integration = await integrationService.getIntegrationById(id);
  return successResponse(res, integration, "Payment integration fetched successfully");
});

export const updateIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const integration = await integrationService.updateIntegration(id, req.body);
  return successResponse(res, integration, "Payment integration updated successfully");
});

export const deleteIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const integration = await integrationService.deleteIntegration(id);
  return successResponse(res, integration, "Payment integration deleted successfully");
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const integration = await integrationService.updateIntegrationStatus(id, status);
  return successResponse(res, integration, `Payment integration status updated to ${status}`);
});

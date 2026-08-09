import { utils, constants } from "../../../../../shared/index.js";
import {
  getCmsSections as fetchSections,
  getCmsSectionById as fetchSectionById,
  createCmsSection as createSection,
  updateCmsSection as modifySection,
  deleteCmsSection as removeSection,
} from "./cms.service.js";

const { asyncHandler, successResponse } = utils;
const { statusCodes } = constants;

export const getCmsSections = asyncHandler(async (req, res) => {
  const data = await fetchSections(req.query);
  return successResponse(res, data, "CMS sections fetched successfully.", statusCodes.HTTP_STATUS.OK);
});

export const getCmsSectionById = asyncHandler(async (req, res) => {
  const section = await fetchSectionById(req.params.id);
  if (!section) {
    return res.status(statusCodes.HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: "CMS section not found.",
    });
  }
  return successResponse(res, section, "CMS section fetched successfully.", statusCodes.HTTP_STATUS.OK);
});

export const createCmsSection = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const section = await createSection(req.body, userId);
  return successResponse(res, section, "CMS section created successfully.", statusCodes.HTTP_STATUS.CREATED);
});

export const updateCmsSection = asyncHandler(async (req, res) => {
  const section = await modifySection(req.params.id, req.body);
  if (!section) {
    return res.status(statusCodes.HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: "CMS section not found or update failed.",
    });
  }
  return successResponse(res, section, "CMS section updated successfully.", statusCodes.HTTP_STATUS.OK);
});

export const deleteCmsSection = asyncHandler(async (req, res) => {
  const section = await removeSection(req.params.id);
  if (!section) {
    return res.status(statusCodes.HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: "CMS section not found or delete failed.",
    });
  }
  return successResponse(res, section, "CMS section deleted successfully.", statusCodes.HTTP_STATUS.OK);
});

import * as service from "./seo.service.js";
import { utils } from "../../../../../shared/index.js";

const { asyncHandler, successResponse } = utils;

const transformRecord = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj.schemaData !== undefined) {
    obj.schema = obj.schemaData;
    delete obj.schemaData;
  }
  return obj;
};

const revertRecord = (body) => {
  if (!body) return body;
  const obj = { ...body };
  if (obj.schema !== undefined) {
    obj.schemaData = obj.schema;
    delete obj.schema;
  }
  return obj;
};

export const getSEORecords = asyncHandler(async (req, res) => {
  const records = await service.getSEORecords(req.query);
  const formatted = records.map(transformRecord);
  return successResponse(res, formatted, "SEO data fetched successfully.");
});

export const getSEORecordByRoute = asyncHandler(async (req, res) => {
  const route = req.query.route || "/";
  const record = await service.getSEORecordByRoute(route);
  if (!record) {
    return successResponse(res, null, "SEO data not found for route: " + route);
  }
  return successResponse(res, transformRecord(record), "SEO data fetched successfully.");
});

export const getSEORecordById = asyncHandler(async (req, res) => {
  const record = await service.getSEORecordById(req.params.id);
  if (!record) {
    return successResponse(res, null, "SEO data not found.");
  }
  return successResponse(res, transformRecord(record), "SEO data fetched successfully.");
});

export const createSEORecord = asyncHandler(async (req, res) => {
  const data = {
    ...revertRecord(req.body),
    createdBy: req.user.id
  };
  const record = await service.createSEORecord(data);
  return successResponse(res, transformRecord(record), "SEO record created successfully.", 201);
});

export const updateSEORecord = asyncHandler(async (req, res) => {
  const record = await service.updateSEORecord(req.params.id, revertRecord(req.body));
  if (!record) {
    return res.status(404).json({
      success: false,
      message: "SEO record not found.",
    });
  }
  return successResponse(res, transformRecord(record), "SEO record updated successfully.");
});

export const deleteSEORecord = asyncHandler(async (req, res) => {
  const record = await service.deleteSEORecord(req.params.id);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: "SEO record not found.",
    });
  }
  return successResponse(res, null, "SEO record deleted successfully.");
});

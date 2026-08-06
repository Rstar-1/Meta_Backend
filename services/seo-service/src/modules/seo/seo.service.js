import { models } from "../../../../../shared/index.js";
const { SEO } = models;

export const getSEORecords = async (query = {}) => {
  const filter = { isDeleted: false };
  if (query.status !== undefined) {
    filter.status = query.status === "true";
  }
  return await SEO.find(filter).sort({ priority: 1 });
};

export const getSEORecordByRoute = async (route) => {
  return await SEO.findOne({ route, isDeleted: false });
};

export const getSEORecordById = async (id) => {
  return await SEO.findOne({ _id: id, isDeleted: false });
};

const calculateSeoScore = (data) => {
  let score = 0;
  
  // Meta Title: max 20
  if (data.meta?.title) {
    score += 10;
    const len = data.meta.title.length;
    if (len >= 30 && len <= 65) {
      score += 10;
    } else {
      score += 5;
    }
  }
  
  // Meta Description: max 20
  if (data.meta?.description) {
    score += 10;
    const len = data.meta.description.length;
    if (len >= 120 && len <= 160) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // Keywords: max 10
  if (data.meta?.keywords && data.meta.keywords.length > 0) {
    score += 10;
  }

  // Canonical: max 10
  if (data.meta?.canonical) {
    score += 10;
  }

  // OG: max 20
  if (data.openGraph?.title) score += 10;
  if (data.openGraph?.description) score += 5;
  if (data.openGraph?.image?.url) score += 5;

  // Twitter: max 10
  if (data.twitter?.title) score += 5;
  if (data.twitter?.description || data.twitter?.image) score += 5;

  // Schema: max 10
  if (data.schemaData?.type) score += 5;
  if (data.schemaData?.name || data.schemaData?.url) score += 5;

  return Math.min(100, score);
};

export const createSEORecord = async (data) => {
  const score = calculateSeoScore(data);
  data.analytics = {
    seoScore: score,
    lastUpdated: new Date()
  };
  return await SEO.create(data);
};

export const updateSEORecord = async (id, data) => {
  const score = calculateSeoScore(data);
  data.analytics = {
    seoScore: score,
    lastUpdated: new Date()
  };
  return await SEO.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  );
};

export const deleteSEORecord = async (id) => {
  return await SEO.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

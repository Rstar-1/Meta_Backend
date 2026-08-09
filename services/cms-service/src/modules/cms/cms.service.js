import { models } from "../../../../../shared/index.js";
const { Cms } = models;

const sanitizeImage = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (Array.isArray(img)) {
    for (const item of img) {
      const sanitized = sanitizeImage(item);
      if (sanitized) return sanitized;
    }
    return "";
  }
  if (typeof img === "object") {
    return img.url || img.path || img.preview || img.src || "";
  }
  return "";
};

const sanitizeImagesArray = (imgs) => {
  if (!imgs) return [];
  if (!Array.isArray(imgs)) {
    const single = sanitizeImage(imgs);
    return single ? [single] : [];
  }
  return imgs.map(sanitizeImage).filter(Boolean);
};

const buildIdQuery = (id) => {
  const isMongoId = Boolean(id && typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/));
  const conditions = [{ customId: id }, { slug: String(id).toLowerCase() }];
  if (isMongoId) {
    conditions.unshift({ _id: id });
  }
  return { isDeleted: false, $or: conditions };
};

export const generateCustomCmsId = async () => {
  const sections = await Cms.find({}, { customId: 1 }).lean();
  let maxNum = 1000;
  sections.forEach((s) => {
    if (s.customId) {
      const match = s.customId.match(/CMS-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  return `CMS-${maxNum + 1}`;
};

export const transformCmsDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.customId || obj._id;
  return obj;
};

export const getCmsSections = async (query = {}) => {
  const filter = { isDeleted: false };

  if (query.status && query.status.toLowerCase() !== "all") {
    filter.status = new RegExp(`^${query.status}$`, "i");
  }

  if (query.category && query.category.toLowerCase() !== "all" && query.category.toLowerCase() !== "all sections") {
    filter.category = new RegExp(`^${query.category}$`, "i");
  }

  const searchTerm = query.search || query.q;
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");
    filter.$or = [
      { title: searchRegex },
      { slug: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
      { customId: searchRegex },
    ];
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 100;
  const skip = (page - 1) * limit;

  const total = await Cms.countDocuments(filter);
  const sections = await Cms.find(filter)
    .populate("createdBy", "name email avatar role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    sections: sections.map(transformCmsDoc),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCmsSectionById = async (id) => {
  const query = buildIdQuery(id);
  const section = await Cms.findOne(query).populate("createdBy", "name email avatar role");
  if (!section) return null;
  return transformCmsDoc(section);
};

export const createCmsSection = async (data, userId = null) => {
  if (!data.customId || !data.customId.match(/^CMS-\d+$/i)) {
    data.customId = await generateCustomCmsId();
  }

  if (!data.slug && data.title) {
    data.slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  data.image = sanitizeImage(data.image);
  data.images = sanitizeImagesArray(data.images);

  if (userId) {
    data.createdBy = userId;
  }

  const section = await Cms.create(data);
  return transformCmsDoc(section);
};

export const updateCmsSection = async (id, data) => {
  const query = buildIdQuery(id);

  if (data.title && !data.slug) {
    data.slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if ("image" in data) {
    data.image = sanitizeImage(data.image);
  }
  if ("images" in data) {
    data.images = sanitizeImagesArray(data.images);
  }

  const section = await Cms.findOneAndUpdate(query, { $set: data }, { returnDocument: "after", runValidators: true }).populate(
    "createdBy",
    "name email avatar role"
  );

  if (!section) return null;
  return transformCmsDoc(section);
};

export const deleteCmsSection = async (id) => {
  const query = buildIdQuery(id);
  const section = await Cms.findOneAndUpdate(query, { $set: { isDeleted: true } }, { returnDocument: "after" });
  return section ? transformCmsDoc(section) : null;
};

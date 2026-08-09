import { models } from "../../../../../shared/index.js";
const { Blog, BlogCategory } = models;

export const getBlogCategories = async (query = {}) => {
  const filter = { isDeleted: false };
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  // Aggregate live blog counts by category
  const blogCounts = await Blog.aggregate([
    { $match: { isDeleted: false, isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  blogCounts.forEach((item) => {
    if (item._id) {
      countMap[item._id.toLowerCase()] = item.count;
    }
  });

  // Fetch defined categories from BlogCategory collection
  const categoriesInDb = await BlogCategory.find(filter).sort({ name: 1 });

  const result = categoriesInDb.map((cat) => {
    const obj = cat.toObject ? cat.toObject() : { ...cat };
    const key = (cat.name || "").toLowerCase();
    obj.count = countMap[key] || cat.count || 0;
    return obj;
  });

  // Include "All" summary only if explicitly requested (e.g. ?includeAll=true)
  if (query.includeAll === "true") {
    const totalBlogs = await Blog.countDocuments({ isDeleted: false, isActive: true });
    result.unshift({ name: "All", count: totalBlogs });
  }

  return result;
};

export const createBlogCategory = async (data) => {
  return await BlogCategory.create(data);
};

export const getBlogCategoryById = async (id) => {
  return await BlogCategory.findOne({ _id: id, isDeleted: false });
};

export const updateBlogCategory = async (id, data) => {
  return await BlogCategory.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  );
};

export const deleteBlogCategory = async (id) => {
  return await BlogCategory.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

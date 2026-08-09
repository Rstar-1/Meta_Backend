import { models } from "../../../../../shared/index.js";
const { Blog, BlogCategory } = models;

export const generateCustomBlogId = async () => {
  const blogs = await Blog.find({}, { customId: 1 }).lean();
  let maxNum = 1000;
  blogs.forEach((b) => {
    if (b.customId) {
      const match = b.customId.match(/BLOG-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  return `BLOG-${maxNum + 1}`;
};

export const calculateReadTime = (data) => {
  let combinedText = "";
  if (data.summary) combinedText += " " + data.summary;
  if (data.description) combinedText += " " + data.description;
  if (data.content) {
    if (typeof data.content === "string") {
      combinedText += " " + data.content;
    } else if (typeof data.content === "object") {
      if (Array.isArray(data.content.intro)) combinedText += " " + data.content.intro.join(" ");
      if (Array.isArray(data.content.sections)) {
        combinedText += " " + data.content.sections.map((s) => `${s.title || ""} ${s.text || ""}`).join(" ");
      }
      if (data.content.outro) combinedText += " " + data.content.outro;
    }
  }
  const wordCount = combinedText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
};

export const generateSchemaPosting = (blog) => {
  if (blog.schemaPosting && Object.keys(blog.schemaPosting).length > 0) {
    return blog.schemaPosting;
  }
  const authorName = (blog.createdBy && blog.createdBy.name) ? blog.createdBy.name : "Ashmita Enterprises";
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.image || (blog.images && blog.images[0]) || "",
    "datePublished": blog.datePublished,
    "dateModified": blog.dateModified || blog.datePublished,
    "author": {
      "@type": "Person",
      "name": authorName,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ashmita Enterprises",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ashmitaenterprises.co.in/sobo_logo.webp",
      },
    },
    "description": blog.description || blog.summary,
  };
};

export const generateSchemaBreadcrumb = (blog) => {
  if (blog.schemaBreadcrumb && Object.keys(blog.schemaBreadcrumb).length > 0) {
    return blog.schemaBreadcrumb;
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.ashmitaenterprises.co.in/home",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.ashmitaenterprises.co.in/blog",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": blog.shareLink || `https://www.ashmitaenterprises.co.in/blog-detail/${blog.slug || blog.customId || blog._id}`,
      },
    ],
  };
};

export const transformBlogDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.customId || obj._id;
  obj.blogPostingSchema = generateSchemaPosting(obj);
  obj.breadcrumbSchema = generateSchemaBreadcrumb(obj);
  return obj;
};

export const getBlogs = async (query = {}) => {
  const filter = { isDeleted: false };

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  } else {
    filter.isActive = true;
  }

  if (query.category && query.category.toLowerCase() !== "all") {
    filter.category = new RegExp(`^${query.category}$`, "i");
  }

  if (query.tag) {
    filter.tag = new RegExp(query.tag, "i");
  }

  const searchTerm = query.search || query.q;
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");
    filter.$or = [
      { title: searchRegex },
      { summary: searchRegex },
      { description: searchRegex },
      { keywords: searchRegex },
      { category: searchRegex },
      { tag: searchRegex },
    ];
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Blog.countDocuments(filter);
  const blogs = await Blog.find(filter)
    .populate("createdBy", "name email avatar role")
    .populate("reviews.createdBy", "name avatar")
    .sort({ datePublished: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const formattedBlogs = blogs.map(transformBlogDoc);

  return {
    blogs: formattedBlogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug, isDeleted: false })
    .populate("createdBy", "name email avatar role")
    .populate("reviews.createdBy", "name avatar");

  if (!blog) return null;

  const formatted = transformBlogDoc(blog);

  // Fetch related posts in same category
  const related = await Blog.find({
    category: blog.category,
    _id: { $ne: blog._id },
    isDeleted: false,
    isActive: true,
  })
    .populate("createdBy", "name email avatar role")
    .sort({ datePublished: -1 })
    .limit(3);

  formatted.relatedPosts = related.map(transformBlogDoc);
  return formatted;
};

export const getBlogById = async (id) => {
  let blog = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    blog = await Blog.findOne({ _id: id, isDeleted: false })
      .populate("createdBy", "name email avatar role")
      .populate("reviews.createdBy", "name avatar");
  }
  if (!blog) {
    blog = await Blog.findOne({ customId: id, isDeleted: false })
      .populate("createdBy", "name email avatar role")
      .populate("reviews.createdBy", "name avatar");
  }
  if (!blog) return null;
  return transformBlogDoc(blog);
};

export const createBlog = async (data) => {
  if (!data.customId || !data.customId.match(/^BLOG-\d+$/i)) {
    data.customId = await generateCustomBlogId();
  }
  data.readTime = calculateReadTime(data);

  const blog = await Blog.create(data);

  if (data.category) {
    const slug = data.category.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
    await BlogCategory.findOneAndUpdate(
      { name: new RegExp(`^${data.category}$`, "i") },
      {
        $setOnInsert: { name: data.category, slug },
        $inc: { count: 1 },
      },
      { upsert: true }
    );
  }

  return transformBlogDoc(blog);
};

export const updateBlog = async (id, data) => {
  let query = { isDeleted: false };
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query._id = id;
  } else {
    query.customId = id;
  }

  if (data.summary !== undefined || data.description !== undefined || data.content !== undefined) {
    const existing = await Blog.findOne(query);
    if (existing) {
      const merged = { ...existing.toObject(), ...data };
      data.readTime = calculateReadTime(merged);
    }
  }

  const blog = await Blog.findOneAndUpdate(query, { $set: data }, { new: true, runValidators: true })
    .populate("createdBy", "name email avatar role")
    .populate("reviews.createdBy", "name avatar");

  if (!blog) return null;
  return transformBlogDoc(blog);
};

export const deleteBlog = async (id) => {
  let query = { isDeleted: false };
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query._id = id;
  } else {
    query.customId = id;
  }

  const blog = await Blog.findOneAndUpdate(query, { $set: { isDeleted: true } }, { new: true });
  if (!blog) return null;

  if (blog.category) {
    await BlogCategory.updateOne(
      { name: new RegExp(`^${blog.category}$`, "i"), count: { $gt: 0 } },
      { $inc: { count: -1 } }
    );
  }

  return blog;
};

export const addReview = async (blogId, userId, reviewData) => {
  let query = { isDeleted: false };
  if (blogId.match(/^[0-9a-fA-F]{24}$/)) {
    query._id = blogId;
  } else {
    query.customId = blogId;
  }

  const review = {
    createdBy: userId,
    comment: reviewData.comment,
    rating: Number(reviewData.rating),
  };

  const blog = await Blog.findOneAndUpdate(
    query,
    { $push: { reviews: review } },
    { new: true, runValidators: true }
  )
    .populate("createdBy", "name email avatar role")
    .populate("reviews.createdBy", "name avatar");

  if (!blog) return null;
  return transformBlogDoc(blog);
};

export const deleteReview = async (blogId, reviewId, userId) => {
  let query = { isDeleted: false };
  if (blogId.match(/^[0-9a-fA-F]{24}$/)) {
    query._id = blogId;
  } else {
    query.customId = blogId;
  }

  const blog = await Blog.findOneAndUpdate(
    query,
    { $pull: { reviews: { _id: reviewId, createdBy: userId } } },
    { new: true }
  )
    .populate("createdBy", "name email avatar role")
    .populate("reviews.createdBy", "name avatar");

  if (!blog) return null;
  return transformBlogDoc(blog);
};

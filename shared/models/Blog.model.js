import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    images: [{
      type: String,
    }],
    datePublished: {
      type: Date,
      default: Date.now,
    },
    dateModified: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: String,
      default: "",
    },
    authorSocials: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    readTime: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    tag: {
      type: String,
      default: "",
      trim: true,
    },
    keywords: {
      type: String,
      default: "",
      trim: true,
    },
    shareLink: {
      type: String,
      default: "",
    },
    content: {
      intro: [{ type: String }],
      sections: [
        {
          id: { type: String },
          title: { type: String },
          text: { type: String },
        },
      ],
      quote: { type: String, default: "" },
      outro: { type: String, default: "" },
    },
    reviews: [reviewSchema],
    schemaPosting: {
      type: Object,
      default: null,
    },
    schemaBreadcrumb: {
      type: Object,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

blogSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (!this.date && this.datePublished) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    this.date = new Date(this.datePublished).toLocaleDateString("en-US", options);
  }
  if (!this.readTime || this.isModified("description") || this.isModified("summary") || this.isModified("content")) {
    let combinedText = (this.summary || "") + " " + (this.description || "");
    if (this.content) {
      if (Array.isArray(this.content.intro)) combinedText += " " + this.content.intro.join(" ");
      if (Array.isArray(this.content.sections)) {
        combinedText += " " + this.content.sections.map((s) => `${s.title || ""} ${s.text || ""}`).join(" ");
      }
      if (this.content.outro) combinedText += " " + this.content.outro;
    }
    const wordCount = combinedText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    this.readTime = `${minutes} min read`;
  }
});

export default mongoose.model("Blog", blogSchema);

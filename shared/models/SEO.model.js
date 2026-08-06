import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    pageName: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    meta: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
      author: { type: String, trim: true },
      language: { type: String, trim: true },
      robots: { type: String, trim: true },
      canonical: { type: String, trim: true },
      themeColor: { type: String, trim: true },
    },
    openGraph: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      url: { type: String, trim: true },
      siteName: { type: String, trim: true },
      type: { type: String, trim: true },
      locale: { type: String, trim: true },
      image: {
        url: { type: String, trim: true },
        width: { type: Number },
        height: { type: Number },
        alt: { type: String, trim: true },
      },
    },
    twitter: {
      card: { type: String, trim: true },
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      image: { type: String, trim: true },
      creator: { type: String, trim: true },
    },
    schemaData: {
      type: {
        type: String,
        trim: true,
      },
      name: { type: String, trim: true },
      url: { type: String, trim: true },
      logo: { type: String, trim: true },
    },
    analytics: {
      seoScore: { type: Number, default: 0 },
      lastUpdated: { type: Date },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("SEO", seoSchema);

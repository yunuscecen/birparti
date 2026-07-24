import mongoose from "mongoose";

const forumCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Forum kategori adı zorunludur."],
      trim: true,
      maxlength: [100, "Kategori adı en fazla 100 karakter olabilir."],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [700, "Kategori açıklaması çok uzun."],
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "#2453ad",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ForumCategory = mongoose.model(
  "ForumCategory",
  forumCategorySchema
);

export default ForumCategory;
import mongoose from "mongoose";

const blogCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Kategori adı zorunludur."],
      trim: true,
      maxlength: [80, "Kategori adı en fazla 80 karakter olabilir."],
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
      maxlength: 600,
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

const BlogCategory = mongoose.model(
  "BlogCategory",
  blogCategorySchema
);

export default BlogCategory;
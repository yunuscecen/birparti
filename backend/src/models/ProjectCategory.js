import mongoose from "mongoose";
import slugify from "slugify";

const projectCategorySchema = new mongoose.Schema(
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
      trim: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Kategori açıklaması en fazla 500 karakter olabilir."],
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

projectCategorySchema.pre("validate", function createSlug(next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: "tr",
    });
  }

  next();
});

const ProjectCategory = mongoose.model(
  "ProjectCategory",
  projectCategorySchema
);

export default ProjectCategory;
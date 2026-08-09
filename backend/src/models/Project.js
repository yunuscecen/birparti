import mongoose from "mongoose";
import slugify from "slugify";

const projectSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },

    body: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const projectImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
    },

    publicId: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    alt: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Proje başlığı zorunludur."],
      trim: true,
      maxlength: [180, "Proje başlığı en fazla 180 karakter olabilir."],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    summary: {
      type: String,
      required: [true, "Proje özeti zorunludur."],
      trim: true,
      maxlength: [600, "Proje özeti en fazla 600 karakter olabilir."],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectCategory",
      required: [true, "Proje kategorisi zorunludur."],
      index: true,
    },

   coverImage: {
  type: projectImageSchema,

  default: () => ({
    url: "",
    publicId: "",
    alt: "",
  }),
},

    sections: {
      type: [projectSectionSchema],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 70,
        default: "",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 180,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.pre(
  "validate",
  function createSlug() {
    if (
      this.title &&
      (
        !this.slug ||
        this.isModified("title")
      )
    ) {
      this.slug = slugify(
        this.title,
        {
          lower: true,
          strict: true,
          locale: "tr",
        }
      );
    }

    if (
      this.status ===
        "published" &&
      !this.publishedAt
    ) {
      this.publishedAt =
        new Date();
    }
  }
);

projectSchema.index({
  title: "text",
  summary: "text",
  tags: "text",
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
import mongoose from "mongoose";

const pageCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [160, "Kart başlığı en fazla 160 karakter olabilir."],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1200, "Kart açıklaması en fazla 1200 karakter olabilir."],
      default: "",
    },

    linkLabel: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },

    linkUrl: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const pageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "cards"],
      required: true,
      default: "text",
    },

    title: {
      type: String,
      trim: true,
      maxlength: [180, "Bölüm başlığı en fazla 180 karakter olabilir."],
      default: "",
    },

    paragraphs: {
      type: [String],
      default: [],
    },

    cards: {
      type: [pageCardSchema],
      default: [],
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const pageContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Sayfa adresi zorunludur."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    eyebrow: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    title: {
      type: String,
      required: [true, "Sayfa başlığı zorunludur."],
      trim: true,
      maxlength: [180, "Sayfa başlığı en fazla 180 karakter olabilir."],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1200, "Sayfa açıklaması en fazla 1200 karakter olabilir."],
      default: "",
    },

    sections: {
      type: [pageSectionSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
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

pageContentSchema.pre("validate", function setPublishedDate(next) {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

const PageContent = mongoose.model(
  "PageContent",
  pageContentSchema
);

export default PageContent;
import mongoose from "mongoose";

const blogSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    body: {
      type: String,
      trim: true,
      maxlength: 20000,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog başlığı zorunludur."],
      trim: true,
      maxlength: [200, "Blog başlığı en fazla 200 karakter olabilir."],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    excerpt: {
      type: String,
      required: [true, "Blog özeti zorunludur."],
      trim: true,
      maxlength: [700, "Blog özeti en fazla 700 karakter olabilir."],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
      index: true,
    },

   coverImage: {
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
    maxlength: 200,
    default: "",
  },
},

    sections: {
      type: [blogSectionSchema],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    authorName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Bir Parti",
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

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
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

blogPostSchema.pre("validate", function setPublishedAt() {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.status !== "published") {
    this.publishedAt = null;
  }
});

blogPostSchema.index({
  status: 1,
  publishedAt: -1,
});

const BlogPost = mongoose.model(
  "BlogPost",
  blogPostSchema
);

export default BlogPost;
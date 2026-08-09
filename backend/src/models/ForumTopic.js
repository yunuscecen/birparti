import mongoose from "mongoose";

const forumTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Konu başlığı zorunludur."],
      trim: true,
      maxlength: [220, "Konu başlığı en fazla 220 karakter olabilir."],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    body: {
      type: String,
      required: [true, "Konu içeriği zorunludur."],
      trim: true,
      maxlength: [30000, "Konu içeriği çok uzun."],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumCategory",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    authorName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Bir Parti",
    },

    status: {
      type: String,
      enum: ["open", "locked", "archived", "hidden"],
      default: "open",
      index: true,
    },

    approvalStatus: {
  type: String,
  enum: [
    "pending",
    "approved",
    "rejected",
  ],
  default: "approved",
  index: true,
},

rejectionReason: {
  type: String,
  trim: true,
  maxlength: 1000,
  default: "",
},

reviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

reviewedAt: {
  type: Date,
  default: null,
},

    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isEdited: {
  type: Boolean,
  default: false,
},

editedAt: {
  type: Date,
  default: null,
},
deletedByAuthor: {
  type: Boolean,
  default: false,
},

deletedAt: {
  type: Date,
  default: null,
},
    lastReplyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

forumTopicSchema.index({
  status: 1,
  isPinned: -1,
  lastActivityAt: -1,
});

forumTopicSchema.index({
  approvalStatus: 1,
  status: 1,
  createdAt: -1,
});

const ForumTopic = mongoose.model(
  "ForumTopic",
  forumTopicSchema
);

export default ForumTopic;
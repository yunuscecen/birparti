import mongoose from "mongoose";

const forumReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ["topic", "reply"],
      required: true,
      index: true,
    },

    /*
     * Aynı kullanıcının aynı içeriği tekrar
     * bildirmesini önlemek için kullanılır.
     *
     * Örnek:
     * topic:64...
     * reply:64...
     */
    targetKey: {
      type: String,
      required: true,
      trim: true,
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumTopic",
      required: true,
      index: true,
    },

    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
      default: null,
      index: true,
    },

    targetAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate",
        "misinformation",
        "personal_data",
        "other",
      ],
      required: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Bildirim açıklaması en fazla 1000 karakter olabilir.",
      ],
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "reviewed",
        "dismissed",
        "action_taken",
      ],
      default: "pending",
      index: true,
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

    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

forumReportSchema.index(
  {
    reporter: 1,
    targetKey: 1,
  },
  {
    unique: true,
  }
);

forumReportSchema.index({
  status: 1,
  createdAt: -1,
});

const ForumReport = mongoose.model(
  "ForumReport",
  forumReportSchema
);

export default ForumReport;
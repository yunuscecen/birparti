import mongoose from "mongoose";

const forumNotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "topic_reply",
        "reply_reply",
        "report_reviewed",
        "report_dismissed",
        "topic_approved",
"topic_rejected",
        "report_action_taken",
      ],
      required: true,
      index: true,
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumTopic",
      default: null,
      index: true,
    },

    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
      default: null,
    },

    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReport",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    link: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    /*
     * Aynı işlem iki kez çalışırsa aynı
     * bildirimin tekrar oluşturulmasını önler.
     */
    uniqueKey: {
      type: String,
      trim: true,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

forumNotificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

forumNotificationSchema.index(
  {
    uniqueKey: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

const ForumNotification = mongoose.model(
  "ForumNotification",
  forumNotificationSchema
);

export default ForumNotification;
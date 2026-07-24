import mongoose from "mongoose";

const forumReplySchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumTopic",
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

    body: {
      type: String,
      required: [true, "Yanıt içeriği zorunludur."],
      trim: true,
      maxlength: [15000, "Yanıt içeriği çok uzun."],
    },

    /*
     * Alt cevabın bağlı olduğu ana yanıt.
     *
     * Ana yanıtlarda null kalır.
     * Alt yanıta cevap verildiğinde de aynı
     * ana yanıtın kimliği kullanılır.
     */
    parentReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
      default: null,
      index: true,
    },

    /*
     * Kullanıcının doğrudan cevap verdiği yanıt.
     * Bu alan @kullanıcı bilgisini ve ilerideki
     * moderasyon işlemlerini korur.
     */
    replyToReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumReply",
      default: null,
    },

    replyToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    replyToName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    status: {
      type: String,
      enum: ["published", "hidden", "deleted"],
      default: "published",
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
  },
  {
    timestamps: true,
  }
);

forumReplySchema.index({
  topic: 1,
  status: 1,
  parentReply: 1,
  createdAt: 1,
});

const ForumReply = mongoose.model(
  "ForumReply",
  forumReplySchema
);

export default ForumReply;
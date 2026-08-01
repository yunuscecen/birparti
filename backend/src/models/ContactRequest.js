import mongoose from "mongoose";

const contactRequestSchema =
  new mongoose.Schema(
    {
      user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
  index: true,
},
      fullName: {
        type: String,
        required: [
          true,
          "Ad soyad zorunludur.",
        ],
        trim: true,
        maxlength: 120,
      },

      email: {
        type: String,
        required: [
          true,
          "E-posta adresi zorunludur.",
        ],
        trim: true,
        lowercase: true,
        maxlength: 254,
        index: true,
      },

      phone: {
        type: String,
        trim: true,
        maxlength: 30,
        default: "",
      },

      type: {
        type: String,
        enum: [
          "suggestion",
          "opinion",
          "complaint",
          "technical",
          "other",
        ],
        required: true,
        index: true,
      },

      subject: {
        type: String,
        required: [
          true,
          "Talep konusu zorunludur.",
        ],
        trim: true,
        maxlength: 160,
      },

      message: {
        type: String,
        required: [
          true,
          "Talep mesajı zorunludur.",
        ],
        trim: true,
        maxlength: 5000,
      },

      status: {
        type: String,
        enum: [
          "new",
          "inReview",
          "answered",
          "closed",
          "spam",
        ],
        default: "new",
        index: true,
      },

      priority: {
        type: String,
        enum: [
          "low",
          "normal",
          "high",
          "urgent",
        ],
        default: "normal",
        index: true,
      },

      adminNote: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },
publicResponse: {
  type: String,
  trim: true,
  maxlength: 5000,
  default: "",
},

respondedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

responseUpdatedAt: {
  type: Date,
  default: null,
},
      privacyAcceptedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },

      answeredAt: {
        type: Date,
        default: null,
      },

      closedAt: {
        type: Date,
        default: null,
      },

      isArchived: {
        type: Boolean,
        default: false,
        index: true,
      },

      archivedAt: {
        type: Date,
        default: null,
      },

      lastUpdatedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

contactRequestSchema.index({
  isArchived: 1,
  status: 1,
  createdAt: -1,
});
contactRequestSchema.index({
  user: 1,
  createdAt: -1,
});
const ContactRequest =
  mongoose.model(
    "ContactRequest",
    contactRequestSchema
  );

export default ContactRequest;
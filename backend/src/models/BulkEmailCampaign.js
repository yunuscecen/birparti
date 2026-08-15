import mongoose from "mongoose";

const allowedRoles = [
  "member",
  "moderator",
  "contentEditor",
  "financeManager",
  "admin",
  "superAdmin",
];

const bulkEmailCampaignSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      emailType: {
        type: String,
        enum: [
          "announcement",
          "system",
        ],
        required: true,
        index: true,
      },

      subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180,
      },

      previewText: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20000,
      },

      actionLabel: {
        type: String,
        trim: true,
        maxlength: 80,
        default: "",
      },

      actionUrl: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

     audienceMode: {
  type: String,
  enum: [
    "all",
    "roles",
    "selected",
  ],
  default: "all",
  index: true,
},

audienceRoles: {
  type: [
    {
      type: String,
      enum: allowedRoles,
    },
  ],
  default: [],
},

selectedRecipients: [
  {
    type:
      mongoose.Schema.Types
        .ObjectId,

    ref: "User",
  },
],

      status: {
        type: String,
        enum: [
          "draft",
          "sending",
          "sent",
          "failed",
          "partially_failed",
        ],
        default: "draft",
        index: true,
      },

      recipientCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      sentCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      failedCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      brevoMessageIds: {
        type: [String],
        default: [],
      },

      lastError: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      sentBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        default: null,
      },

      sendStartedAt: {
        type: Date,
        default: null,
      },

      sentAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

bulkEmailCampaignSchema.index({
  status: 1,
  createdAt: -1,
});

const BulkEmailCampaign =
  mongoose.model(
    "BulkEmailCampaign",
    bulkEmailCampaignSchema
  );

export default BulkEmailCampaign;
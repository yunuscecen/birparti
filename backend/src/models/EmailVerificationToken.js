import mongoose from "mongoose";

const emailVerificationTokenSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      expiresAt: {
        type: Date,
        required: true,

        index: {
          expires: 0,
        },
      },

      consumedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const EmailVerificationToken =
  mongoose.model(
    "EmailVerificationToken",
    emailVerificationTokenSchema
  );

export default EmailVerificationToken;
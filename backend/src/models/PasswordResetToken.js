import mongoose from "mongoose";

const passwordResetTokenSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
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
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

const PasswordResetToken =
  mongoose.model(
    "PasswordResetToken",
    passwordResetTokenSchema
  );

export default PasswordResetToken;
import mongoose from "mongoose";

const transparencyRecordSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          "income",
          "expense",
        ],
        required: true,
        index: true,
      },

      category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      /*
       * Para değerleri küsurat hatası
       * oluşmaması için kuruş olarak saklanır.
       */
      amountKurus: {
        type: Number,
        required: true,
        min: 1,

        validate: {
          validator:
            Number.isInteger,

          message:
            "Tutar tam sayı kuruş olarak saklanmalıdır.",
        },
      },

      currency: {
        type: String,
        enum: ["TRY"],
        default: "TRY",
      },

      transactionDate: {
        type: Date,
        required: true,
        index: true,
      },

      documentUrl: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "draft",
          "published",
          "archived",
        ],
        default: "draft",
        index: true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      updatedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

transparencyRecordSchema.index({
  status: 1,
  transactionDate: -1,
});

transparencyRecordSchema.index({
  status: 1,
  type: 1,
  transactionDate: -1,
});

const TransparencyRecord =
  mongoose.model(
    "TransparencyRecord",
    transparencyRecordSchema
  );

export default TransparencyRecord;
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Ad zorunludur."],
      trim: true,
      minlength: [2, "Ad en az 2 karakter olmalıdır."],
      maxlength: [50, "Ad en fazla 50 karakter olabilir."],
    },

    lastName: {
      type: String,
      required: [true, "Soyad zorunludur."],
      trim: true,
      minlength: [2, "Soyad en az 2 karakter olmalıdır."],
      maxlength: [50, "Soyad en fazla 50 karakter olabilir."],
    },

    email: {
      type: String,
      required: [true, "E-posta adresi zorunludur."],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: [160, "E-posta adresi çok uzun."],
    },

    password: {
      type: String,
      required: [true, "Şifre zorunludur."],
      minlength: [8, "Şifre en az 8 karakter olmalıdır."],
      maxlength: [72, "Şifre en fazla 72 karakter olabilir."],
      select: false,
    },

    role: {
      type: String,
      enum: [
        "member",
        "moderator",
        "contentEditor",
        "financeManager",
        "admin",
        "superAdmin",
      ],
      default: "member",
      index: true,
    },

    permissions: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    avatar: {
      url: {
        type: String,
        trim: true,
        default: "",
      },

      publicId: {
        type: String,
        trim: true,
        default: "",
      },
    },

    consents: {
      termsAcceptedAt: {
        type: Date,
        required: true,
      },

      privacyAcceptedAt: {
        type: Date,
        required: true,
      },

      marketingAcceptedAt: {
        type: Date,
        default: null,
      },
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,

      transform(document, returnedObject) {
        delete returnedObject.password;
        delete returnedObject.__v;

        return returnedObject;
      },
    },
  }
);

userSchema.virtual("fullName").get(function getFullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);

  // Aynı saniyede üretilen access tokenın yanlışlıkla geçersiz
  // sayılmasını önlemek için bir saniye geriye alıyoruz.
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(
  tokenIssuedAt
) {
  if (!this.passwordChangedAt || !tokenIssuedAt) {
    return false;
  }

  const changedAtSeconds = Math.floor(
    this.passwordChangedAt.getTime() / 1000
  );

  return changedAtSeconds > tokenIssuedAt;
};

const User = mongoose.model("User", userSchema);

export default User;
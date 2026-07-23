import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.js";
import User from "../models/User.js";
import { superAdminPermissions } from "../config/permissions.js";

const seedSuperAdmin = async () => {
  try {
    await connectDatabase();

    const firstName =
      process.env.SUPER_ADMIN_FIRST_NAME?.trim();

    const lastName =
      process.env.SUPER_ADMIN_LAST_NAME?.trim();

    const email =
      process.env.SUPER_ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    const password =
      process.env.SUPER_ADMIN_PASSWORD;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      throw new Error(
        "Super admin ortam değişkenleri eksik."
      );
    }

    if (password.length < 10) {
      throw new Error(
        "Super admin şifresi en az 10 karakter olmalıdır."
      );
    }

    let user = await User.findOne({
      email,
    }).select("+password");

    const now = new Date();

    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        password,

        role: "superAdmin",
        permissions: superAdminPermissions,
        status: "active",

        isEmailVerified: true,
        emailVerifiedAt: now,

        consents: {
          termsAcceptedAt: now,
          privacyAcceptedAt: now,
          marketingAcceptedAt: null,
        },
      });
    } else {
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = password;
      user.role = "superAdmin";
      user.permissions = superAdminPermissions;
      user.status = "active";
      user.isEmailVerified = true;
      user.emailVerifiedAt =
        user.emailVerifiedAt || now;
    }

    await user.save();

    console.log(
      `Super admin hazırlandı: ${user.email}`
    );
  } catch (error) {
    console.error(
      "Super admin oluşturulamadı:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedSuperAdmin();
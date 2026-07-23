import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.js";
import PageContent from "../models/PageContent.js";
import { pageSeedData } from "./pageSeedData.js";

const seedPages = async () => {
  try {
    await connectDatabase();

    console.log("Sabit sayfa içerikleri hazırlanıyor...");

    for (const pageData of pageSeedData) {
      await PageContent.findOneAndUpdate(
        {
          slug: pageData.slug,
        },
        {
          $set: {
            ...pageData,
            publishedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );
    }

    console.log("Sabit sayfa içerikleri başarıyla oluşturuldu.");
  } catch (error) {
    console.error("Sayfa seed işlemi başarısız:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedPages();
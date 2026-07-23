import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.js";
import Project from "../models/Project.js";
import ProjectCategory from "../models/ProjectCategory.js";
import {
  projectCategorySeedData,
  projectSeedData,
} from "./projectSeedData.js";

const seedProjects = async () => {
  try {
    await connectDatabase();

    console.log("Proje kategorileri hazırlanıyor...");

    for (const categoryData of projectCategorySeedData) {
      await ProjectCategory.findOneAndUpdate(
        {
          slug: categoryData.slug,
        },
        {
          $set: categoryData,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    const categories = await ProjectCategory.find({}).lean();

    const categoryMap = categories.reduce((result, category) => {
      result[category.slug] = category;
      return result;
    }, {});

    console.log("Projeler hazırlanıyor...");

    for (const projectData of projectSeedData) {
      const category = categoryMap[projectData.categorySlug];

      if (!category) {
        throw new Error(
          `${projectData.title} için kategori bulunamadı.`
        );
      }

      const {
        categorySlug,
        ...projectFields
      } = projectData;

      await Project.findOneAndUpdate(
        {
          slug: projectFields.slug,
        },
        {
          $set: {
            ...projectFields,
            category: category._id,
            status: "published",
            publishedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Proje verileri başarıyla oluşturuldu.");
  } catch (error) {
    console.error("Seed işlemi başarısız:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedProjects();
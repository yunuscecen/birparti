import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";

import connectDatabase from "../config/db.js";
import ForumCategory from "../models/ForumCategory.js";
import ForumTopic from "../models/ForumTopic.js";

const createSlug = (value) => {
  return slugify(value, {
    lower: true,
    strict: true,
    locale: "tr",
  });
};

const categoryData = [
  {
    name: "Genel Tartışma",
    description:
      "Toplumsal meseleler ve gündeme ilişkin düşüncelerin paylaşıldığı alan.",
    color: "#2453ad",
    sortOrder: 1,
  },
  {
    name: "Projeler ve Öneriler",
    description:
      "Projelerimiz hakkındaki görüşlerin ve yeni önerilerin konuşulduğu alan.",
    color: "#287d74",
    sortOrder: 2,
  },
  {
    name: "Yerel Katılım",
    description:
      "Mahalle, ilçe ve şehir düzeyindeki sorunların ve çözümlerin konuşulduğu alan.",
    color: "#9a651d",
    sortOrder: 3,
  },
];

const seedForum = async () => {
  try {
    await connectDatabase();

    const categoryMap = {};

    for (const item of categoryData) {
      const slug = createSlug(item.name);

      const category =
        await ForumCategory.findOneAndUpdate(
          {
            slug,
          },
          {
            $set: {
              ...item,
              slug,
              isActive: true,
            },
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );

      categoryMap[slug] = category;
    }

    const topics = [
      {
        title: "Forumumuza Hoş Geldiniz",
        body:
          "Bu forum; görüşlerin özgürce, saygılı ve yapıcı bir şekilde paylaşılması için oluşturuldu. Farklı düşüncelerin birbirini dinlediği ve ortak çözümlerin geliştirildiği bir alan kurmayı amaçlıyoruz.",
        category:
          categoryMap["genel-tartisma"]._id,
        authorName: "Bir Parti",
        status: "open",
        isPinned: true,
      },
      {
        title: "Projeler Hakkındaki Görüşlerinizi Paylaşın",
        body:
          "Projelerimizi inceleyerek güçlü bulduğunuz yönleri, eksik gördüğünüz noktaları ve geliştirme önerilerinizi bu başlık altında paylaşabilirsiniz.",
        category:
          categoryMap["projeler-ve-oneriler"]._id,
        authorName: "Bir Parti",
        status: "open",
        isPinned: false,
      },
    ];

    for (const topicData of topics) {
      const slug = createSlug(topicData.title);

      await ForumTopic.findOneAndUpdate(
        {
          slug,
        },
        {
          $set: {
            ...topicData,
            slug,
            lastActivityAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log("Forum kategorileri ve konuları hazırlandı.");
  } catch (error) {
    console.error("Forum seed işlemi başarısız:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedForum();
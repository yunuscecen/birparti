import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";

import connectDatabase from "../config/db.js";
import BlogCategory from "../models/BlogCategory.js";
import BlogPost from "../models/BlogPost.js";

const createSlug = (value) => {
  return slugify(value, {
    lower: true,
    strict: true,
    locale: "tr",
  });
};

const categories = [
  {
    name: "Demokrasi",
    description:
      "Demokrasi, katılım ve temsil üzerine yazılar.",
    color: "#2453ad",
    sortOrder: 1,
  },
  {
    name: "Toplum",
    description:
      "Toplumsal dayanışma ve ortak yaşam üzerine yazılar.",
    color: "#287d74",
    sortOrder: 2,
  },
  {
    name: "Ekonomi",
    description:
      "Emek, üretim ve adil paylaşım üzerine yazılar.",
    color: "#9a651d",
    sortOrder: 3,
  },
];

const seedBlog = async () => {
  try {
    await connectDatabase();

    const categoryMap = {};

    for (const categoryData of categories) {
      const slug = createSlug(categoryData.name);

      const category =
        await BlogCategory.findOneAndUpdate(
          {
            slug,
          },
          {
            $set: {
              ...categoryData,
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

    const posts = [
      {
        title: "Siyasette Yeni Bir Katılım Kültürü",
        excerpt:
          "Siyasetin yalnızca seçim dönemlerinde değil, gündelik yaşamın her alanında birlikte kurulması gerektiğine inanıyoruz.",
        category:
          categoryMap.demokrasi._id,
        coverImage: {
          url: "",
          alt: "Siyasette katılım kültürü",
        },
        sections: [
          {
            heading: "",
            body:
              "Demokratik katılım yalnızca oy vermekten ibaret değildir. İnsanların yaşadıkları mahallede, çalıştıkları kurumda ve ülkenin geleceğine ilişkin alınan kararlarda söz sahibi olabilmesi gerekir.",
            sortOrder: 0,
          },
          {
            heading: "",
            body:
              "Yeni bir siyaset anlayışı, yurttaşları yalnızca dinleyen değil, karar süreçlerine doğrudan dahil eden açık ve şeffaf mekanizmalar kurmalıdır.",
            sortOrder: 1,
          },
        ],
        tags: ["demokrasi", "katılım", "temsil"],
        status: "published",
        isFeatured: true,
      },
      {
        title: "Dayanışmayı Yeniden Kurmak",
        excerpt:
          "Toplumsal dayanışmanın güçlü olduğu bir ülkede hiç kimse kendisini yalnız ve çaresiz hissetmemelidir.",
        category:
          categoryMap.toplum._id,
        coverImage: {
          url: "",
          alt: "Toplumsal dayanışma",
        },
        sections: [
          {
            heading: "",
            body:
              "Dayanışma yalnızca zor zamanlarda hatırlanan bir kavram değildir. Adil bir toplumun gündelik işleyişinin temelidir.",
            sortOrder: 0,
          },
          {
            heading: "",
            body:
              "Yerel topluluklardan kamu kurumlarına kadar herkesin birbirini desteklediği, şeffaf ve erişilebilir bir sosyal yapı kurulmalıdır.",
            sortOrder: 1,
          },
        ],
        tags: ["toplum", "dayanışma", "adalet"],
        status: "published",
        isFeatured: false,
      },
      {
        title: "Emeğin Karşılığını Aldığı Bir Ekonomi",
        excerpt:
          "Üreten insanların refahtan adil pay aldığı, güvenli ve öngörülebilir bir ekonomik düzen mümkündür.",
        category:
          categoryMap.ekonomi._id,
        coverImage: {
          url: "",
          alt: "Emek ve adil ekonomi",
        },
        sections: [
          {
            heading: "",
            body:
              "Ekonomik büyümenin gerçek anlamı, toplumun geniş kesimlerinin yaşam koşullarının iyileşmesidir.",
            sortOrder: 0,
          },
          {
            heading: "",
            body:
              "Çalışanların haklarını koruyan, küçük üreticiyi destekleyen ve fırsat eşitliğini güçlendiren politikalar temel öncelik olmalıdır.",
            sortOrder: 1,
          },
        ],
        tags: ["ekonomi", "emek", "üretim"],
        status: "published",
        isFeatured: false,
      },
    ];

    for (const postData of posts) {
      const slug = createSlug(postData.title);

      await BlogPost.findOneAndUpdate(
        {
          slug,
        },
        {
          $set: {
            ...postData,
            slug,
            authorName: "Bir Parti",
            publishedAt: new Date(),
            seo: {
              title: `${postData.title} | Bir Parti`,
              description: postData.excerpt,
            },
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log(
      "Blog kategorileri ve yazıları hazırlandı."
    );
  } catch (error) {
    console.error(
      "Blog seed işlemi başarısız:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedBlog();
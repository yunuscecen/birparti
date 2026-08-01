import mongoose from "mongoose";
import slugify from "slugify";

import BlogCategory from "../models/BlogCategory.js";
import BlogPost from "../models/BlogPost.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteCloudinaryImage,
} from "../services/cloudinaryService.js";
const createSlug = (value = "") => {
  return slugify(value, {
    lower: true,
    strict: true,
    locale: "tr",
  });
};

const escapeRegExp = (value = "") => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(
      "Geçersiz kayıt kimliği.",
      400
    );
  }
};

const findBlogCategory = async (
  categoryId
) => {
  ensureObjectId(categoryId);

  const category =
    await BlogCategory.findById(
      categoryId
    );

  if (!category) {
    throw new AppError(
      "Blog kategorisi bulunamadı.",
      404
    );
  }

  return category;
};

const populateBlogPost = async (
  post
) => {
  await post.populate([
    {
      path: "category",
      select:
        "name slug description color isActive sortOrder",
    },
    {
      path: "author",
      select:
        "firstName lastName email",
    },
  ]);

  return post;
};

const deleteUnusedBlogCoverSafely =
  async (publicId) => {
    const normalizedPublicId =
      String(
        publicId || ""
      ).trim();

    if (!normalizedPublicId) {
      return;
    }

    try {
      /*
       * Görsel başka bir blog
       * yazısında kullanılıyorsa
       * Cloudinary'den silme.
       */
      const imageStillInUse =
        await BlogPost.exists({
          "coverImage.publicId":
            normalizedPublicId,
        });

      if (imageStillInUse) {
        return;
      }

      await deleteCloudinaryImage(
        normalizedPublicId
      );
    } catch (error) {
      /*
       * Veritabanı işlemi tamamlandıysa
       * Cloudinary temizleme hatası
       * isteği başarısız göstermemeli.
       */
      console.error(
        "Blog cover image cleanup error:",
        {
          publicId:
            normalizedPublicId,

          message:
            error?.message ||
            "Bilinmeyen hata",
        }
      );
    }
  };

/**
 * GET /api/admin/blog-categories
 */
export const getAdminBlogCategories =
  asyncHandler(async (req, res) => {
    const categories =
      await BlogCategory.find()
        .sort({
          sortOrder: 1,
          name: 1,
        })
        .lean();

    res.status(200).json({
      success: true,

      data: {
        categories,
      },
    });
  });

/**
 * POST /api/admin/blog-categories
 */
export const createAdminBlogCategory =
  asyncHandler(async (req, res) => {
    const data = req.validatedBody;

    const category =
      await BlogCategory.create({
        ...data,

        slug: createSlug(
          data.slug || data.name
        ),
      });

    res.status(201).json({
      success: true,
      message:
        "Blog kategorisi oluşturuldu.",

      data: {
        category,
      },
    });
  });

/**
 * PATCH /api/admin/blog-categories/:categoryId
 */
export const updateAdminBlogCategory =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.categoryId
    );

    const category =
      await BlogCategory.findById(
        req.params.categoryId
      );

    if (!category) {
      throw new AppError(
        "Blog kategorisi bulunamadı.",
        404
      );
    }

    const data = req.validatedBody;

    category.name = data.name;

    category.slug = createSlug(
      data.slug || data.name
    );

    category.description =
      data.description;

    category.color = data.color;

    category.isActive =
      data.isActive;

    category.sortOrder =
      data.sortOrder;

    await category.save();

    res.status(200).json({
      success: true,
      message:
        "Blog kategorisi güncellendi.",

      data: {
        category,
      },
    });
  });

/**
 * DELETE /api/admin/blog-categories/:categoryId
 */
export const deleteAdminBlogCategory =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.categoryId
    );

    const category =
      await BlogCategory.findById(
        req.params.categoryId
      );

    if (!category) {
      throw new AppError(
        "Blog kategorisi bulunamadı.",
        404
      );
    }

    const postCount =
      await BlogPost.countDocuments({
        category: category._id,
      });

    if (postCount > 0) {
      throw new AppError(
        "Bu kategoriye bağlı blog yazıları bulunduğu için kategori silinemez.",
        409
      );
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Blog kategorisi silindi.",
    });
  });

/**
 * GET /api/admin/blog-posts
 */
export const getAdminBlogPosts =
  asyncHandler(async (req, res) => {
    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          req.query.limit,
          10
        ) || 12,
        1
      ),
      50
    );

    const search = String(
      req.query.search || ""
    ).trim();

    const category = String(
      req.query.category || ""
    ).trim();

    const status = String(
      req.query.status || ""
    ).trim();

    const filter = {};

    if (search) {
      const safeSearch =
        escapeRegExp(search);

      filter.$or = [
        {
          title: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          excerpt: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    if (
      category &&
      mongoose.isValidObjectId(category)
    ) {
      filter.category = category;
    }

    if (
      [
        "draft",
        "published",
        "archived",
      ].includes(status)
    ) {
      filter.status = status;
    }

    const skip =
      (page - 1) * limit;

    const [posts, totalPosts] =
      await Promise.all([
        BlogPost.find(filter)
          .populate({
            path: "category",
            select:
              "name slug color isActive",
          })
          .populate({
            path: "author",
            select:
              "firstName lastName",
          })
          .select("-sections")
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        BlogPost.countDocuments(
          filter
        ),
      ]);

    res.status(200).json({
      success: true,

      data: {
        posts,

        pagination: {
          page,
          limit,
          totalPosts,

          totalPages: Math.max(
            Math.ceil(
              totalPosts / limit
            ),
            1
          ),

          hasPreviousPage:
            page > 1,

          hasNextPage:
            page <
            Math.max(
              Math.ceil(
                totalPosts / limit
              ),
              1
            ),
        },
      },
    });
  });

/**
 * GET /api/admin/blog-posts/:postId
 */
export const getAdminBlogPostById =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.postId
    );

    const post =
      await BlogPost.findById(
        req.params.postId
      )
        .populate({
          path: "category",
          select:
            "name slug color isActive",
        })
        .populate({
          path: "author",
          select:
            "firstName lastName email",
        });

    if (!post) {
      throw new AppError(
        "Blog yazısı bulunamadı.",
        404
      );
    }

    post.sections.sort(
      (
        firstSection,
        secondSection
      ) =>
        firstSection.sortOrder -
        secondSection.sortOrder
    );

    res.status(200).json({
      success: true,

      data: {
        post,
      },
    });
  });

/**
 * POST /api/admin/blog-posts
 */
export const createAdminBlogPost =
  asyncHandler(async (req, res) => {
    const data = req.validatedBody;

    const category =
      await findBlogCategory(
        data.category
      );

    const fullName =
      `${req.user.firstName} ${req.user.lastName}`.trim();

    const post =
      await BlogPost.create({
        title: data.title,

        slug: createSlug(
          data.slug || data.title
        ),

        excerpt: data.excerpt,

        category: category._id,

        coverImage:
          data.coverImage,

        sections:
          data.sections.map(
            (
              section,
              index
            ) => ({
              heading:
                section.heading,

              body:
                section.body,

              sortOrder:
                index,
            })
          ),

        tags: data.tags,

        author: req.user._id,

        authorName:
          fullName || "Bir Parti",

        status: data.status,

        isFeatured:
          data.isFeatured,

        publishedAt:
          data.status ===
          "published"
            ? new Date()
            : null,

        seo: data.seo,
      });

    await populateBlogPost(post);

    res.status(201).json({
      success: true,
      message:
        "Blog yazısı oluşturuldu.",

      data: {
        post,
      },
    });
  });

/**
 * PATCH /api/admin/blog-posts/:postId
 */
export const updateAdminBlogPost =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.postId
    );

    const post =
      await BlogPost.findById(
        req.params.postId
      );

    if (!post) {
      throw new AppError(
        "Blog yazısı bulunamadı.",
        404
      );
    }
const previousCoverImagePublicId =
  String(
    post.coverImage
      ?.publicId || ""
  ).trim();
    const data = req.validatedBody;

    const category =
      await findBlogCategory(
        data.category
      );

    post.title = data.title;

    post.slug = createSlug(
      data.slug || data.title
    );

    post.excerpt =
      data.excerpt;

    post.category =
      category._id;

    post.coverImage =
      data.coverImage;

    post.sections =
      data.sections.map(
        (
          section,
          index
        ) => ({
          heading:
            section.heading,

          body: section.body,

          sortOrder:
            index,
        })
      );

    post.tags = data.tags;

    post.status =
      data.status;

    post.isFeatured =
      data.isFeatured;

    post.seo = data.seo;

    if (
      data.status ===
        "published" &&
      !post.publishedAt
    ) {
      post.publishedAt =
        new Date();
    }

    if (
      data.status !==
      "published"
    ) {
      post.publishedAt = null;
    }

   await post.save();

const nextCoverImagePublicId =
  String(
    post.coverImage
      ?.publicId || ""
  ).trim();

if (
  previousCoverImagePublicId &&
  previousCoverImagePublicId !==
    nextCoverImagePublicId
) {
  await deleteUnusedBlogCoverSafely(
    previousCoverImagePublicId
  );
}

await populateBlogPost(post);

    res.status(200).json({
      success: true,
      message:
        "Blog yazısı güncellendi.",

      data: {
        post,
      },
    });
  });

/**
 * DELETE /api/admin/blog-posts/:postId
 */
export const deleteAdminBlogPost =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.postId
    );

    const post =
      await BlogPost.findById(
        req.params.postId
      );

    if (!post) {
      throw new AppError(
        "Blog yazısı bulunamadı.",
        404
      );
    }

    const coverImagePublicId =
  String(
    post.coverImage
      ?.publicId || ""
  ).trim();

await post.deleteOne();

if (coverImagePublicId) {
  await deleteUnusedBlogCoverSafely(
    coverImagePublicId
  );
}

    res.status(200).json({
      success: true,
      message:
        "Blog yazısı silindi.",
    });
  });
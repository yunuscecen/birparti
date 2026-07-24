import BlogCategory from "../models/BlogCategory.js";
import BlogPost from "../models/BlogPost.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegExp = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getPublicBlogCategories = asyncHandler(
  async (req, res) => {
    const categories = await BlogCategory.find({
      isActive: true,
    })
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
  }
);

export const getPublishedBlogPosts = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 9,
        1
      ),
      30
    );

    const search = String(req.query.search || "").trim();
    const categorySlug = String(
      req.query.category || ""
    ).trim();

    const featured = String(
      req.query.featured || ""
    ).trim();

    const filter = {
      status: "published",
      publishedAt: {
        $lte: new Date(),
      },
    };

    if (search) {
      const safeSearch = escapeRegExp(search);

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

    if (categorySlug) {
      const category = await BlogCategory.findOne({
        slug: categorySlug,
        isActive: true,
      }).select("_id");

      if (!category) {
        return res.status(200).json({
          success: true,
          data: {
            posts: [],
            pagination: {
              page: 1,
              limit,
              totalPosts: 0,
              totalPages: 1,
            },
          },
        });
      }

      filter.category = category._id;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      BlogPost.find(filter)
        .populate({
          path: "category",
          select: "name slug color",
        })
        .select("-sections")
        .sort({
          isFeatured: -1,
          publishedAt: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      BlogPost.countDocuments(filter),
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
            Math.ceil(totalPosts / limit),
            1
          ),
        },
      },
    });
  }
);

export const getPublishedBlogPostBySlug = asyncHandler(
  async (req, res) => {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    const post = await BlogPost.findOneAndUpdate(
      {
        slug,
        status: "published",
        publishedAt: {
          $lte: new Date(),
        },
      },
      {
        $inc: {
          viewCount: 1,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: "category",
        select: "name slug color",
      })
      .populate({
        path: "author",
        select: "firstName lastName",
      })
      .lean();

    if (!post) {
      throw new AppError(
        "Blog yazısı bulunamadı.",
        404
      );
    }

    post.sections = [...(post.sections || [])].sort(
      (firstSection, secondSection) =>
        firstSection.sortOrder -
        secondSection.sortOrder
    );

    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  }
);
import Project from "../models/Project.js";
import ProjectCategory from "../models/ProjectCategory.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegExp = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * GET /api/projects
 * Yayınlanmış projeleri listeler.
 */
export const getPublishedProjects = asyncHandler(
  async (req, res) => {
    const search = String(req.query.search || "").trim();
    const categorySlug = String(req.query.category || "").trim();

    const filter = {
      status: "published",
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
          summary: {
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
      const category = await ProjectCategory.findOne({
        slug: categorySlug,
        isActive: true,
      }).select("_id");

      if (!category) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      filter.category = category._id;
    }

    const projects = await Project.find(filter)
      .populate({
        path: "category",
        select: "name slug color",
        match: {
          isActive: true,
        },
      })
      .sort({
        isFeatured: -1,
        sortOrder: 1,
        publishedAt: -1,
        createdAt: -1,
      })
      .lean();

    const visibleProjects = projects.filter(
      (project) => project.category
    );

    res.status(200).json({
      success: true,
      count: visibleProjects.length,
      data: visibleProjects,
    });
  }
);

/**
 * GET /api/projects/:slug
 * Tek bir yayınlanmış projenin detayını getirir.
 */
export const getPublishedProjectBySlug = asyncHandler(
  async (req, res) => {
    const project = await Project.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate({
        path: "category",
        select: "name slug color",
      })
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  }
);

/**
 * GET /api/project-categories
 * Aktif proje kategorilerini listeler.
 */
export const getProjectCategories = asyncHandler(
  async (req, res) => {
    const categories = await ProjectCategory.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  }
);
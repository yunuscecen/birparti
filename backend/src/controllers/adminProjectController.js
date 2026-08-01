import mongoose from "mongoose";
import slugify from "slugify";

import Project from "../models/Project.js";
import ProjectCategory from "../models/ProjectCategory.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  deleteCloudinaryImage,
} from "../services/cloudinaryService.js";

const createSlug = (value) => {
  return slugify(value || "", {
    lower: true,
    strict: true,
    locale: "tr",
  });
};

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(
      "Geçersiz kayıt kimliği.",
      400
    );
  }
};

const findCategory = async (categoryId) => {
  ensureObjectId(categoryId);

  const category =
    await ProjectCategory.findById(categoryId);

  if (!category) {
    throw new AppError(
      "Proje kategorisi bulunamadı.",
      404
    );
  }

  return category;
};

const populateProject = async (project) => {
  await project.populate({
    path: "category",
    select:
      "name slug description color isActive sortOrder",
  });

  return project;
};

const deleteUnusedProjectImageSafely =
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
       * Aynı görsel başka bir
       * projede kullanılıyorsa silme.
       */
      const imageStillInUse =
        await Project.exists({
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
       * Proje işlemi başarıyla
       * tamamlandıysa Cloudinary
       * temizleme hatası API yanıtını
       * başarısız hâle getirmemeli.
       */
      console.error(
        "Project cover image cleanup error:",
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

export const getAdminProjectCategories =
  asyncHandler(async (req, res) => {
    const categories =
      await ProjectCategory.find()
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

export const createAdminProjectCategory =
  asyncHandler(async (req, res) => {
    const data = req.validatedBody;

    const category =
      await ProjectCategory.create({
        ...data,
        slug: createSlug(
          data.slug || data.name
        ),
      });

    res.status(201).json({
      success: true,
      message: "Proje kategorisi oluşturuldu.",
      data: {
        category,
      },
    });
  });

export const updateAdminProjectCategory =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.categoryId);

    const category =
      await ProjectCategory.findById(
        req.params.categoryId
      );

    if (!category) {
      throw new AppError(
        "Proje kategorisi bulunamadı.",
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
    category.isActive = data.isActive;
    category.sortOrder = data.sortOrder;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Proje kategorisi güncellendi.",
      data: {
        category,
      },
    });
  });

export const deleteAdminProjectCategory =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.categoryId);

    const category =
      await ProjectCategory.findById(
        req.params.categoryId
      );

    if (!category) {
      throw new AppError(
        "Proje kategorisi bulunamadı.",
        404
      );
    }

    const projectCount =
      await Project.countDocuments({
        category: category._id,
      });

    if (projectCount > 0) {
      throw new AppError(
        "Bu kategoriye bağlı projeler bulunduğu için kategori silinemez.",
        409
      );
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Proje kategorisi silindi.",
    });
  });

export const getAdminProjects =
  asyncHandler(async (req, res) => {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
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

    const status = String(
      req.query.status || ""
    ).trim();

    const category = String(
      req.query.category || ""
    ).trim();

    const filter = {};

    if (search) {
      const escapedSearch =
        search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      filter.$or = [
        {
          title: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          summary: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (
      ["draft", "published", "archived"].includes(
        status
      )
    ) {
      filter.status = status;
    }

    if (
      category &&
      mongoose.isValidObjectId(category)
    ) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    const [projects, totalProjects] =
      await Promise.all([
        Project.find(filter)
          .populate({
            path: "category",
            select:
              "name slug color isActive",
          })
          .sort({
            sortOrder: 1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Project.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      data: {
        projects,

        pagination: {
          page,
          limit,
          totalProjects,
          totalPages: Math.max(
            Math.ceil(
              totalProjects / limit
            ),
            1
          ),
        },
      },
    });
  });

export const getAdminProjectById =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.projectId);

    const project =
      await Project.findById(
        req.params.projectId
      ).populate({
        path: "category",
        select:
          "name slug color isActive",
      });

    if (!project) {
      throw new AppError(
        "Proje bulunamadı.",
        404
      );
    }

    res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  });

export const createAdminProject =
  asyncHandler(async (req, res) => {
    const data = req.validatedBody;

    const category =
      await findCategory(data.category);

    const project =
      await Project.create({
        ...data,

        category: category._id,

        slug: createSlug(
          data.slug || data.title
        ),

        publishedAt:
          data.status === "published"
            ? new Date()
            : null,
      });

    await populateProject(project);

    res.status(201).json({
      success: true,
      message: "Proje oluşturuldu.",
      data: {
        project,
      },
    });
  });

export const updateAdminProject =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.projectId);

    const project =
      await Project.findById(
        req.params.projectId
      );

    if (!project) {
      throw new AppError(
        "Proje bulunamadı.",
        404
      );
    }

    const previousCoverImagePublicId =
  String(
    project.coverImage
      ?.publicId || ""
  ).trim();

    const data = req.validatedBody;

    const category =
      await findCategory(data.category);

    project.title = data.title;
    project.slug = createSlug(
      data.slug || data.title
    );
    project.summary = data.summary;
    project.category = category._id;
    project.coverImage =
      data.coverImage;
    project.sections = data.sections;
    project.tags = data.tags;
    project.status = data.status;
    project.isFeatured =
      data.isFeatured;
    project.sortOrder =
      data.sortOrder;
    project.seo = data.seo;

    if (
      data.status === "published" &&
      !project.publishedAt
    ) {
      project.publishedAt =
        new Date();
    }

    if (data.status !== "published") {
      project.publishedAt = null;
    }

    await project.save();

const nextCoverImagePublicId =
  String(
    project.coverImage
      ?.publicId || ""
  ).trim();

if (
  previousCoverImagePublicId &&
  previousCoverImagePublicId !==
    nextCoverImagePublicId
) {
  await deleteUnusedProjectImageSafely(
    previousCoverImagePublicId
  );
}

    await populateProject(project);

    res.status(200).json({
      success: true,
      message: "Proje güncellendi.",
      data: {
        project,
      },
    });
  });

export const deleteAdminProject =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.projectId);

    const project =
      await Project.findById(
        req.params.projectId
      );

    if (!project) {
      throw new AppError(
        "Proje bulunamadı.",
        404
      );
    }
const coverImagePublicId =
  String(
    project.coverImage
      ?.publicId || ""
  ).trim();
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Proje silindi.",
    });
  });
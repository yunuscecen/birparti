import express from "express";

import {
  createAdminProject,
  createAdminProjectCategory,
  deleteAdminProject,
  deleteAdminProjectCategory,
  getAdminProjectById,
  getAdminProjectCategories,
  getAdminProjects,
  updateAdminProject,
  updateAdminProjectCategory,
} from "../controllers/adminProjectController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  adminProjectCategorySchema,
  adminProjectSchema,
} from "../validators/adminProjectValidators.js";

const router = express.Router();

router.use(
  "/admin",
  requireAuth,
  requireRole("admin", "superAdmin")
);

router.get(
  "/admin/project-categories",
  getAdminProjectCategories
);

router.post(
  "/admin/project-categories",
  validateRequest(
    adminProjectCategorySchema
  ),
  createAdminProjectCategory
);

router.patch(
  "/admin/project-categories/:categoryId",
  validateRequest(
    adminProjectCategorySchema
  ),
  updateAdminProjectCategory
);

router.delete(
  "/admin/project-categories/:categoryId",
  deleteAdminProjectCategory
);

router.get(
  "/admin/projects",
  getAdminProjects
);

router.get(
  "/admin/projects/:projectId",
  getAdminProjectById
);

router.post(
  "/admin/projects",
  validateRequest(adminProjectSchema),
  createAdminProject
);

router.patch(
  "/admin/projects/:projectId",
  validateRequest(adminProjectSchema),
  updateAdminProject
);

router.delete(
  "/admin/projects/:projectId",
  deleteAdminProject
);

export default router;
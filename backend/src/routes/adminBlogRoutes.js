import express from "express";

import {
  createAdminBlogCategory,
  createAdminBlogPost,
  deleteAdminBlogCategory,
  deleteAdminBlogPost,
  getAdminBlogCategories,
  getAdminBlogPostById,
  getAdminBlogPosts,
  updateAdminBlogCategory,
  updateAdminBlogPost,
} from "../controllers/adminBlogController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  adminBlogCategorySchema,
  adminBlogPostSchema,
} from "../validators/adminBlogValidators.js";

const router = express.Router();

router.use(
  "/admin",
  requireAuth,
  requireRole(
    "admin",
    "superAdmin"
  )
);

router.get(
  "/admin/blog-categories",
  getAdminBlogCategories
);

router.post(
  "/admin/blog-categories",
  validateRequest(
    adminBlogCategorySchema
  ),
  createAdminBlogCategory
);

router.patch(
  "/admin/blog-categories/:categoryId",
  validateRequest(
    adminBlogCategorySchema
  ),
  updateAdminBlogCategory
);

router.delete(
  "/admin/blog-categories/:categoryId",
  deleteAdminBlogCategory
);

router.get(
  "/admin/blog-posts",
  getAdminBlogPosts
);

router.get(
  "/admin/blog-posts/:postId",
  getAdminBlogPostById
);

router.post(
  "/admin/blog-posts",
  validateRequest(
    adminBlogPostSchema
  ),
  createAdminBlogPost
);

router.patch(
  "/admin/blog-posts/:postId",
  validateRequest(
    adminBlogPostSchema
  ),
  updateAdminBlogPost
);

router.delete(
  "/admin/blog-posts/:postId",
  deleteAdminBlogPost
);

export default router;
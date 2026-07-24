import express from "express";

import {
  getPublicBlogCategories,
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
} from "../controllers/blogController.js";

const router = express.Router();

router.get(
  "/blog-categories",
  getPublicBlogCategories
);

router.get(
  "/blog-posts",
  getPublishedBlogPosts
);

router.get(
  "/blog-posts/:slug",
  getPublishedBlogPostBySlug
);

export default router;
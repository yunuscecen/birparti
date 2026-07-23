import express from "express";
import {
  getProjectCategories,
  getPublishedProjectBySlug,
  getPublishedProjects,
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/project-categories", getProjectCategories);

router.get("/projects", getPublishedProjects);

router.get("/projects/:slug", getPublishedProjectBySlug);

export default router;
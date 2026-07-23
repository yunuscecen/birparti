import express from "express";
import { getPublishedPageBySlug } from "../controllers/pageController.js";

const router = express.Router();

router.get("/pages/:slug", getPublishedPageBySlug);

export default router;
import express from "express";
import { getPublicHomePage } from "../controllers/homePageController.js";

const router = express.Router();

router.get(
  "/homepage",
  getPublicHomePage
);

export default router;
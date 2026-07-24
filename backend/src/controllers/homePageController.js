import HomePageContent from "../models/HomePageContent.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/homepage
 */
export const getPublicHomePage =
  asyncHandler(async (req, res) => {
    const content =
      await HomePageContent.findOne({
        key: "home",
      }).lean();

    if (!content) {
      throw new AppError(
        "Ana sayfa içeriği henüz veritabanına kaydedilmemiş.",
        404
      );
    }

    content.featureCards = [
      ...(content.featureCards || []),
    ].sort(
      (firstCard, secondCard) =>
        firstCard.sortOrder -
        secondCard.sortOrder
    );

    content.sections = [
  ...(content.sections || []),
].sort(
  (firstSection, secondSection) =>
    firstSection.sortOrder -
    secondSection.sortOrder
);

    res.status(200).json({
      success: true,

      data: {
        content,
      },
    });
  });
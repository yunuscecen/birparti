import HomePageContent from "../models/HomePageContent.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/admin/homepage
 */
export const getAdminHomePage =
  asyncHandler(async (req, res) => {
    const content =
      await HomePageContent.findOne({
        key: "home",
      }).lean();

    if (content) {
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
    }

    res.status(200).json({
      success: true,

      data: {
        content: content || null,
      },
    });
  });

/**
 * PUT /api/admin/homepage
 */
export const updateAdminHomePage =
  asyncHandler(async (req, res) => {
    const {
      hero,
      featureCards,
      manifesto,
      seo,
    } = req.validatedBody;

    const normalizedCards =
      featureCards.map(
        (card, index) => ({
          title: card.title,
          description: card.description,
          buttonLabel: card.buttonLabel,
          path: card.path,
          sortOrder: index,
        })
      );

    const content =
      await HomePageContent.findOneAndUpdate(
        {
          key: "home",
        },
        {
          $set: {
            hero,
            featureCards: normalizedCards,
            manifesto,
            seo,
          },

          $setOnInsert: {
            key: "home",
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Ana sayfa içeriği başarıyla güncellendi.",

      data: {
        content,
      },
    });
  });
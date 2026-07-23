import PageContent from "../models/PageContent.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/pages/:slug
 * Yayında olan sabit sayfayı getirir.
 */
export const getPublishedPageBySlug = asyncHandler(
  async (req, res) => {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    const page = await PageContent.findOne({
      slug,
      status: "published",
    }).lean();

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Sayfa içeriği bulunamadı.",
      });
    }

    const sortedSections = [...(page.sections || [])]
      .sort((first, second) => {
        return first.sortOrder - second.sortOrder;
      })
      .map((section) => ({
        ...section,
        cards: [...(section.cards || [])].sort(
          (first, second) =>
            first.sortOrder - second.sortOrder
        ),
      }));

    res.status(200).json({
      success: true,
      data: {
        ...page,
        sections: sortedSections,
      },
    });
  }
);
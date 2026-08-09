import PageContent from "../models/PageContent.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const managedPageSlugs = [
  "manifesto",
  "yol-haritasi",
  "seffaflik",
  "neye-karsiyiz",
];

const ensureManagedPageSlug = (slug) => {
  if (!managedPageSlugs.includes(slug)) {
    throw new AppError(
      "Bu sayfa yönetim panelinden düzenlenemiyor.",
      400
    );
  }
};

const normalizeSlug = (value = "") => {
  return String(value).trim().toLowerCase();
};

const sortPageContent = (page) => {
  const normalizedPage = page.toObject
    ? page.toObject()
    : page;

  return {
    ...normalizedPage,

    sections: [...(normalizedPage.sections || [])]
      .sort(
        (firstSection, secondSection) =>
          firstSection.sortOrder -
          secondSection.sortOrder
      )
      .map((section) => ({
        ...section,

        cards: [...(section.cards || [])].sort(
          (firstCard, secondCard) =>
            firstCard.sortOrder -
            secondCard.sortOrder
        ),
      })),
  };
};

/**
 * GET /api/admin/pages
 */
export const getAdminPages = asyncHandler(
  async (req, res) => {
    const pages = await PageContent.find({
      slug: {
        $in: managedPageSlugs,
      },
    })
      .select(
        "slug eyebrow title description status publishedAt seo createdAt updatedAt"
      )
      .lean();

    const pageOrder = new Map(
      managedPageSlugs.map((slug, index) => [
        slug,
        index,
      ])
    );

    pages.sort((firstPage, secondPage) => {
      return (
        pageOrder.get(firstPage.slug) -
        pageOrder.get(secondPage.slug)
      );
    });

    res.status(200).json({
      success: true,

      data: {
        pages,
      },
    });
  }
);

/**
 * GET /api/admin/pages/:slug
 */
export const getAdminPageBySlug = asyncHandler(
  async (req, res) => {
    const slug = normalizeSlug(req.params.slug);

    ensureManagedPageSlug(slug);

    const page = await PageContent.findOne({
      slug,
    });

    if (!page) {
      throw new AppError(
        "Sayfa içeriği bulunamadı. Önce sayfa seed işlemini çalıştırın.",
        404
      );
    }

    res.status(200).json({
      success: true,

      data: {
        page: sortPageContent(page),
      },
    });
  }
);

/**
 * PATCH /api/admin/pages/:slug
 */
export const updateAdminPageBySlug = asyncHandler(
  async (req, res) => {
    const slug = normalizeSlug(req.params.slug);

    ensureManagedPageSlug(slug);

    const page = await PageContent.findOne({
      slug,
    });

    if (!page) {
      throw new AppError(
        "Güncellenecek sayfa bulunamadı.",
        404
      );
    }

    const {
      eyebrow,
      title,
      description,
      sections,
      status,
      seo,
    } = req.validatedBody;

    page.eyebrow = eyebrow;
    page.title = title;
    page.description = description;

    page.sections = sections.map(
      (section, sectionIndex) => ({
        type: section.type,
        title: section.title,

        paragraphs:
          section.type === "text"
            ? section.paragraphs
            : [],

        cards:
          section.type === "cards"
            ? section.cards.map(
                (card, cardIndex) => ({
                  title: card.title,
                  description:
                    card.description,
                  linkLabel:
                    card.linkLabel,
                  linkUrl: card.linkUrl,
                  sortOrder: cardIndex,
                })
              )
            : [],

        sortOrder: sectionIndex,
      })
    );

    page.status = status;
    page.seo = seo;

    if (status === "published") {
      page.publishedAt =
        page.publishedAt || new Date();
    } else {
      page.publishedAt = null;
    }

    await page.save();

    res.status(200).json({
      success: true,
      message: "Sayfa içeriği başarıyla güncellendi.",

      data: {
        page: sortPageContent(page),
      },
    });
  }
);
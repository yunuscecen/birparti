import mongoose from "mongoose";

import ContactRequest from "../models/ContactRequest.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const ensureObjectId = (id) => {
  if (
    !mongoose.isValidObjectId(id)
  ) {
    throw new AppError(
      "Geçersiz talep kimliği.",
      400
    );
  }
};

const escapeRegExp = (
  value = ""
) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const createRequestRecord = async ({
  data,
  user = null,
}) => {
  return ContactRequest.create({
    user: user?._id || null,

    fullName: user
      ? `${user.firstName} ${user.lastName}`.trim()
      : data.fullName,

    email: user
      ? user.email
      : data.email,

    phone: data.phone,
    type: data.type,
    subject: data.subject,
    message: data.message,

    privacyAcceptedAt:
      new Date(),
  });
};

const sendCreatedResponse = (
  res,
  request
) => {
  res.status(201).json({
    success: true,

    message:
      "Talebiniz başarıyla alınmıştır.",

    data: {
      request: {
        id: request._id,

        createdAt:
          request.createdAt,
      },
    },
  });
};

export const createContactRequest =
  asyncHandler(
    async (req, res) => {
      const data =
        req.validatedBody;

      /*
       * Honeypot alanı doluysa istek
       * büyük ihtimalle bottan gelmiştir.
       */
      if (data.website) {
        return res
          .status(201)
          .json({
            success: true,

            message:
              "Talebiniz alınmıştır.",
          });
      }

      const request =
        await createRequestRecord({
          data,
        });

      sendCreatedResponse(
        res,
        request
      );
    }
  );

export const createAccountContactRequest =
  asyncHandler(
    async (req, res) => {
      const data =
        req.validatedBody;

      if (data.website) {
        return res
          .status(201)
          .json({
            success: true,

            message:
              "Talebiniz alınmıştır.",
          });
      }

      const request =
        await createRequestRecord({
          data,
          user: req.user,
        });

      sendCreatedResponse(
        res,
        request
      );
    }
  );

export const getMyContactRequests =
  asyncHandler(
    async (req, res) => {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 10,
          1
        ),
        30
      );

      const status = String(
        req.query.status || ""
      ).trim();

      /*
       * Kullanıcı kimliği URL'den veya
       * formdan alınmaz. Doğrudan güvenli
       * oturum bilgisinden alınır.
       */
      const filter = {
        user: req.user._id,
      };

      if (
        [
          "new",
          "inReview",
          "answered",
          "closed",
          "spam",
        ].includes(status)
      ) {
        filter.status = status;
      }

      const skip =
        (page - 1) * limit;

      const [
        requests,
        totalRequests,
      ] = await Promise.all([
        ContactRequest.find(filter)
          /*
           * Yönetici notu ve yönetim
           * bilgileri kullanıcıya
           * gönderilmez.
           */
          .select(
            [
              "type",
              "subject",
              "message",
              "status",
              "publicResponse",
              "responseUpdatedAt",
              "answeredAt",
              "closedAt",
              "createdAt",
              "updatedAt",
            ].join(" ")
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        ContactRequest.countDocuments(
          filter
        ),
      ]);

      res.status(200).json({
        success: true,

        data: {
          requests,

          pagination: {
            page,
            limit,
            totalRequests,

            totalPages:
              Math.max(
                Math.ceil(
                  totalRequests /
                    limit
                ),
                1
              ),
          },
        },
      });
    }
  );

export const getAdminContactRequests =
  asyncHandler(
    async (req, res) => {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 15,
          1
        ),
        50
      );

      const search = String(
        req.query.search || ""
      ).trim();

      const status = String(
        req.query.status || ""
      ).trim();

      const type = String(
        req.query.type || ""
      ).trim();

      const priority = String(
        req.query.priority || ""
      ).trim();

      const archived = String(
        req.query.archived || "false"
      ).trim();

      const filter = {};

      if (search) {
        const safeSearch =
          escapeRegExp(search);

        filter.$or = [
          {
            fullName: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
          {
            subject: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
        ];
      }

      if (
        [
          "new",
          "inReview",
          "answered",
          "closed",
          "spam",
        ].includes(status)
      ) {
        filter.status = status;
      }

      if (
        [
          "suggestion",
          "opinion",
          "complaint",
          "technical",
          "other",
        ].includes(type)
      ) {
        filter.type = type;
      }

      if (
        [
          "low",
          "normal",
          "high",
          "urgent",
        ].includes(priority)
      ) {
        filter.priority =
          priority;
      }

      if (archived !== "all") {
        filter.isArchived =
          archived === "true";
      }

      const skip =
        (page - 1) * limit;

      const [
        requests,
        totalRequests,
      ] = await Promise.all([
        ContactRequest.find(
          filter
        )
          .populate({
            path:
              "lastUpdatedBy",
            select:
              "firstName lastName email",
          })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        ContactRequest.countDocuments(
          filter
        ),
      ]);

      res.status(200).json({
        success: true,

        data: {
          requests,

          pagination: {
            page,
            limit,
            totalRequests,

            totalPages:
              Math.max(
                Math.ceil(
                  totalRequests /
                    limit
                ),
                1
              ),
          },
        },
      });
    }
  );

export const getAdminContactRequestById =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.requestId
      );

      const request =
        await ContactRequest.findById(
          req.params.requestId
        ).populate({
          path:
            "lastUpdatedBy",
          select:
            "firstName lastName email",
        });

      if (!request) {
        throw new AppError(
          "Talep bulunamadı.",
          404
        );
      }

      res.status(200).json({
        success: true,

        data: {
          request,
        },
      });
    }
  );

export const updateAdminContactRequest =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.requestId
      );

      const request =
        await ContactRequest.findById(
          req.params.requestId
        );

      if (!request) {
        throw new AppError(
          "Talep bulunamadı.",
          404
        );
      }

      const data =
        req.validatedBody;

      if (
        data.status !==
        undefined
      ) {
        request.status =
          data.status;

        if (
          data.status ===
            "answered" &&
          !request.answeredAt
        ) {
          request.answeredAt =
            new Date();
        }

        if (
          data.status ===
          "closed"
        ) {
          request.closedAt =
            new Date();
        }

        if (
          data.status !==
          "closed"
        ) {
          request.closedAt =
            null;
        }
      }

      if (
        data.priority !==
        undefined
      ) {
        request.priority =
          data.priority;
      }

      if (
        data.adminNote !==
        undefined
      ) {
        request.adminNote =
          data.adminNote;
      }
if (
  data.publicResponse !==
    undefined &&
  data.publicResponse !==
    (request.publicResponse || "")
) {
  request.publicResponse =
    data.publicResponse;

  if (data.publicResponse) {
    const responseDate =
      new Date();

    request.respondedBy =
      req.user._id;

    request.responseUpdatedAt =
      responseDate;

    if (!request.answeredAt) {
      request.answeredAt =
        responseDate;
    }

    /*
     * Yönetici kullanıcıya cevap
     * yazdıysa yeni veya incelenen
     * talep otomatik yanıtlandı olur.
     */
    if (
      [
        "new",
        "inReview",
      ].includes(
        request.status
      )
    ) {
      request.status =
        "answered";
    }
  } else {
    request.respondedBy =
      null;

    request.responseUpdatedAt =
      null;
  }
}
      if (
        data.isArchived !==
        undefined
      ) {
        request.isArchived =
          data.isArchived;

        request.archivedAt =
          data.isArchived
            ? new Date()
            : null;
      }

      request.lastUpdatedBy =
        req.user._id;

      await request.save();

      await request.populate({
        path:
          "lastUpdatedBy",
        select:
          "firstName lastName email",
      });

      res.status(200).json({
        success: true,

        message:
          "Talep güncellendi.",

        data: {
          request,
        },
      });
    }
  );
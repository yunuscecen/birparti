import mongoose from "mongoose";

import TransparencyRecord from "../models/TransparencyRecord.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegExp = (
  value = ""
) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const serializeRecord = (
  record
) => {
  const data =
    record.toObject
      ? record.toObject()
      : record;

  return {
    ...data,
    amount:
      data.amountKurus / 100,
  };
};

/**
 * GET /api/admin/transparency
 */
export const getAdminTransparencyRecords =
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
          ) || 20,
          1
        ),
        100
      );

      const type = String(
        req.query.type || ""
      ).trim();

      const status = String(
        req.query.status || ""
      ).trim();

      const search = String(
        req.query.search || ""
      ).trim();

      const filter = {};

      if (
        [
          "income",
          "expense",
        ].includes(type)
      ) {
        filter.type = type;
      }

      if (
        [
          "draft",
          "published",
          "archived",
        ].includes(status)
      ) {
        filter.status = status;
      }

      if (search) {
        const safeSearch =
          escapeRegExp(search);

        filter.$or = [
          {
            title: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
          {
            category: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
          {
            description: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
        ];
      }

      const skip =
        (page - 1) * limit;

      const [
        records,
        totalRecords,
      ] = await Promise.all([
        TransparencyRecord.find(
          filter
        )
          .sort({
            transactionDate: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit),

        TransparencyRecord.countDocuments(
          filter
        ),
      ]);

      res.status(200).json({
        success: true,

        data: {
          records:
            records.map(
              serializeRecord
            ),

          pagination: {
            page,
            limit,
            totalRecords,

            totalPages:
              Math.max(
                Math.ceil(
                  totalRecords /
                    limit
                ),
                1
              ),
          },
        },
      });
    }
  );

/**
 * POST /api/admin/transparency
 */
export const createAdminTransparencyRecord =
  asyncHandler(
    async (req, res) => {
      const {
        type,
        category,
        title,
        description,
        amount,
        transactionDate,
        documentUrl,
        status,
      } = req.validatedBody;

      const userId =
        req.user?._id ||
        req.user?.id;

      const record =
        await TransparencyRecord.create({
          type,
          category,
          title,
          description,

          amountKurus:
            Math.round(
              amount * 100
            ),

          transactionDate,
          documentUrl,
          status,
          createdBy: userId,
          updatedBy: userId,
        });

      res.status(201).json({
        success: true,

        message:
          "Şeffaflık kaydı oluşturuldu.",

        data: {
          record:
            serializeRecord(
              record
            ),
        },
      });
    }
  );

/**
 * PATCH /api/admin/transparency/:recordId
 */
export const updateAdminTransparencyRecord =
  asyncHandler(
    async (req, res) => {
      const {
        recordId,
      } = req.params;

      if (
        !mongoose.isValidObjectId(
          recordId
        )
      ) {
        throw new AppError(
          "Geçersiz kayıt kimliği.",
          400
        );
      }

      const record =
        await TransparencyRecord.findById(
          recordId
        );

      if (!record) {
        throw new AppError(
          "Şeffaflık kaydı bulunamadı.",
          404
        );
      }

      const {
        type,
        category,
        title,
        description,
        amount,
        transactionDate,
        documentUrl,
        status,
      } = req.validatedBody;

      record.type = type;
      record.category =
        category;
      record.title = title;
      record.description =
        description;

      record.amountKurus =
        Math.round(
          amount * 100
        );

      record.transactionDate =
        transactionDate;

      record.documentUrl =
        documentUrl;

      record.status = status;

      record.updatedBy =
        req.user?._id ||
        req.user?.id;

      await record.save();

      res.status(200).json({
        success: true,

        message:
          "Şeffaflık kaydı güncellendi.",

        data: {
          record:
            serializeRecord(
              record
            ),
        },
      });
    }
  );
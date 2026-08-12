import mongoose from "mongoose";

import BulkEmailCampaign from "../models/BulkEmailCampaign.js";
import User from "../models/User.js";

import {
  sendBulkEmailCampaign,
  sendBulkEmailTest,
  verifyPreferenceToken,
} from "../services/brevoBulkEmailService.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedRoles = [
  "member",
  "moderator",
  "contentEditor",
  "financeManager",
  "admin",
  "superAdmin",
];

const ensureObjectId = (
  id
) => {
  if (
    !mongoose.isValidObjectId(
      id
    )
  ) {
    throw new AppError(
      "Geçersiz kampanya kimliği.",
      400
    );
  }
};

const parseRoles = (
  value = ""
) => {
  const roles = String(value)
    .split(",")
    .map((role) =>
      role.trim()
    )
    .filter((role) =>
      allowedRoles.includes(
        role
      )
    );

  return [
    ...new Set(roles),
  ];
};

const getRecipientFilter = ({
  emailType,
  audienceRoles = [],
}) => {
  const filter = {
    status: "active",
    isEmailVerified: true,
  };

  if (
    emailType ===
    "announcement"
  ) {
    filter[
      "consents.marketingAcceptedAt"
    ] = {
      $ne: null,
    };
  }

  if (
    audienceRoles.length > 0
  ) {
    filter.role = {
      $in: audienceRoles,
    };
  }

  return filter;
};

export const getBulkEmailAudienceCount =
  asyncHandler(
    async (req, res) => {
      const emailType =
        req.query.emailType ===
        "system"
          ? "system"
          : "announcement";

      const audienceRoles =
        parseRoles(
          req.query.roles
        );

      const count =
        await User.countDocuments(
          getRecipientFilter({
            emailType,
            audienceRoles,
          })
        );

      res.status(200).json({
        success: true,

        data: {
          count,
        },
      });
    }
  );

export const getAdminBulkEmailCampaigns =
  asyncHandler(
    async (req, res) => {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = 15;
      const skip =
        (page - 1) *
        limit;

      const [
        campaigns,
        total,
      ] = await Promise.all([
        BulkEmailCampaign.find()
          .populate({
            path: "createdBy",
            select:
              "firstName lastName email",
          })
          .populate({
            path: "sentBy",
            select:
              "firstName lastName email",
          })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        BulkEmailCampaign
          .countDocuments(),
      ]);

      res.status(200).json({
        success: true,

        data: {
          campaigns,

          pagination: {
            page,
            limit,
            total,

            totalPages:
              Math.max(
                Math.ceil(
                  total / limit
                ),
                1
              ),
          },
        },
      });
    }
  );

export const createAdminBulkEmailCampaign =
  asyncHandler(
    async (req, res) => {
      const campaign =
        await BulkEmailCampaign.create({
          ...req.validatedBody,
          createdBy:
            req.user._id,
        });

      res.status(201).json({
        success: true,

        message:
          "Toplu e-posta taslağı oluşturuldu.",

        data: {
          campaign,
        },
      });
    }
  );

export const getAdminBulkEmailCampaignById =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.campaignId
      );

      const campaign =
        await BulkEmailCampaign
          .findById(
            req.params
              .campaignId
          )
          .populate({
            path: "createdBy",
            select:
              "firstName lastName email",
          })
          .populate({
            path: "sentBy",
            select:
              "firstName lastName email",
          });

      if (!campaign) {
        throw new AppError(
          "Kampanya bulunamadı.",
          404
        );
      }

      res.status(200).json({
        success: true,

        data: {
          campaign,
        },
      });
    }
  );

export const updateAdminBulkEmailCampaign =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.campaignId
      );

      const campaign =
        await BulkEmailCampaign.findById(
          req.params
            .campaignId
        );

      if (!campaign) {
        throw new AppError(
          "Kampanya bulunamadı.",
          404
        );
      }

      if (
        campaign.status !==
        "draft"
      ) {
        throw new AppError(
          "Yalnızca taslak kampanyalar düzenlenebilir.",
          409
        );
      }

      Object.assign(
        campaign,
        req.validatedBody
      );

      await campaign.save();

      res.status(200).json({
        success: true,

        message:
          "Kampanya güncellendi.",

        data: {
          campaign,
        },
      });
    }
  );

export const sendAdminBulkEmailTest =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.campaignId
      );

      const campaign =
        await BulkEmailCampaign.findById(
          req.params
            .campaignId
        );

      if (!campaign) {
        throw new AppError(
          "Kampanya bulunamadı.",
          404
        );
      }

      await sendBulkEmailTest({
        campaign,
        user: req.user,
      });

      res.status(200).json({
        success: true,

        message:
          `Test e-postası ${req.user.email} adresine gönderildi.`,
      });
    }
  );

export const sendAdminBulkEmailCampaign =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.campaignId
      );

      const campaign =
        await BulkEmailCampaign.findById(
          req.params
            .campaignId
        );

      if (!campaign) {
        throw new AppError(
          "Kampanya bulunamadı.",
          404
        );
      }

      if (
        campaign.status !==
        "draft"
      ) {
        throw new AppError(
          "Bu kampanya daha önce gönderilmiş veya gönderime alınmış.",
          409
        );
      }

      const users =
        await User.find(
          getRecipientFilter({
            emailType:
              campaign.emailType,

            audienceRoles:
              campaign
                .audienceRoles,
          })
        )
          .select(
            "_id firstName lastName email"
          )
          .lean();

      if (
        users.length === 0
      ) {
        throw new AppError(
          "Seçilen hedef kitlede gönderim yapılabilecek üye bulunamadı.",
          400
        );
      }

      campaign.status =
        "sending";

      campaign.recipientCount =
        users.length;

      campaign.sentCount = 0;
      campaign.failedCount = 0;
      campaign.lastError = "";

      campaign.sentBy =
        req.user._id;

      campaign.sendStartedAt =
        new Date();

      await campaign.save();

      try {
        const result =
          await sendBulkEmailCampaign({
            campaign,
            users,
          });

        campaign.status =
          "sent";

        campaign.sentCount =
          result.sentCount;

        campaign.failedCount =
          0;

        campaign
          .brevoMessageIds =
          result.messageIds;

        campaign.sentAt =
          new Date();

        await campaign.save();

        res.status(200).json({
          success: true,

          message:
            `${result.sentCount} üyeye toplu e-posta gönderildi.`,

          data: {
            campaign,
          },
        });
      } catch (error) {
        const sentCount =
          error
            .deliveryProgress
            ?.sentCount || 0;

        campaign.sentCount =
          sentCount;

        campaign.failedCount =
          Math.max(
            users.length -
              sentCount,
            0
          );

        campaign.status =
          sentCount > 0
            ? "partially_failed"
            : "failed";

        campaign.lastError =
          String(
            error.message ||
              "Gönderim hatası"
          ).slice(
            0,
            2000
          );

        campaign
          .brevoMessageIds =
          error
            .deliveryProgress
            ?.messageIds || [];

        await campaign.save();

        throw new AppError(
          sentCount > 0
            ? "E-postaların bir bölümü gönderildi, bir bölümünde hata oluştu."
            : "Toplu e-posta gönderilemedi.",
          502
        );
      }
    }
  );

export const unsubscribeMarketingEmails =
  asyncHandler(
    async (req, res) => {
      let tokenData;

      try {
        tokenData =
          verifyPreferenceToken(
            req.params.token
          );
      } catch {
        throw new AppError(
          "E-posta tercih bağlantısı geçersiz.",
          400
        );
      }

      const user =
        await User.findOne({
          _id:
            tokenData.userId,

          email:
            tokenData.email,
        });

      if (!user) {
        throw new AppError(
          "E-posta tercihi güncellenemedi.",
          404
        );
      }

      user.consents
        .marketingAcceptedAt =
        null;

      user.consents
        .marketingUnsubscribedAt =
        new Date();

      await user.save({
        validateBeforeSave:
          false,
      });

      res.status(200).json({
        success: true,

        message:
          "Duyuru e-postası aboneliğiniz sonlandırıldı.",
      });
    }
  );
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createAccessToken,
  createRawRefreshToken,
  getClearRefreshCookieOptions,
  getRefreshCookieOptions,
  getRefreshTokenExpiry,
  hashRefreshToken,
  refreshCookieName,
} from "../utils/authTokens.js";

const serializeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: user.role,
  permissions: user.permissions || [],
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

const getRequestMetadata = (req) => ({
  userAgent: String(req.headers["user-agent"] || "").slice(
    0,
    500
  ),

  ipAddress: String(
    req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      ""
  ).slice(0, 100),
});

const saveRefreshToken = async ({
  user,
  tokenHash,
  expiresAt,
  req,
}) => {
  const metadata = getRequestMetadata(req);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    ...metadata,
  });
};

const issueSession = async ({ user, req, res }) => {
  const accessToken = createAccessToken(user);

  const rawRefreshToken = createRawRefreshToken();
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const expiresAt = getRefreshTokenExpiry();

  await saveRefreshToken({
    user,
    tokenHash,
    expiresAt,
    req,
  });

  res.cookie(
    refreshCookieName,
    rawRefreshToken,
    getRefreshCookieOptions()
  );

  return accessToken;
};

const clearRefreshCookie = (res) => {
  res.clearCookie(
    refreshCookieName,
    getClearRefreshCookieOptions()
  );
};

export const register = asyncHandler(
  async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password,
      acceptedTerms,
      acceptedPrivacy,
      acceptedMarketing,
    } = req.validatedBody;

    const existingUser = await User.findOne({
      email,
    }).select("_id");

    if (existingUser) {
      throw new AppError(
        "Bu e-posta adresiyle daha önce üyelik oluşturulmuş.",
        409
      );
    }

    const now = new Date();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,

      consents: {
        termsAcceptedAt: acceptedTerms ? now : null,
        privacyAcceptedAt: acceptedPrivacy ? now : null,
        marketingAcceptedAt: acceptedMarketing ? now : null,
      },
    });

    const accessToken = await issueSession({
      user,
      req,
      res,
    });

    res.status(201).json({
      success: true,
      message: "Üyeliğiniz başarıyla oluşturuldu.",

      data: {
        user: serializeUser(user),
        accessToken,
      },
    });
  }
);

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new AppError(
      "E-posta adresi veya şifre hatalı.",
      401
    );
  }

  const isPasswordCorrect =
    await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError(
      "E-posta adresi veya şifre hatalı.",
      401
    );
  }

  if (user.status === "suspended") {
    throw new AppError(
      "Kullanıcı hesabınız askıya alınmış.",
      403
    );
  }

  if (user.status !== "active") {
    throw new AppError(
      "Kullanıcı hesabınız henüz aktif değil.",
      403
    );
  }

  user.lastLoginAt = new Date();

  await user.save({
    validateBeforeSave: false,
  });

  const accessToken = await issueSession({
    user,
    req,
    res,
  });

  res.status(200).json({
    success: true,
    message: "Giriş başarılı.",

    data: {
      user: serializeUser(user),
      accessToken,
    },
  });
});

export const refreshSession = asyncHandler(
  async (req, res) => {
    const rawRefreshToken =
      req.cookies?.[refreshCookieName];

    if (!rawRefreshToken) {
      throw new AppError(
        "Yenilenebilir bir oturum bulunamadı.",
        401
      );
    }

    const currentTokenHash =
      hashRefreshToken(rawRefreshToken);

    const nextRawRefreshToken =
      createRawRefreshToken();

    const nextTokenHash = hashRefreshToken(
      nextRawRefreshToken
    );

    const now = new Date();

    // findOneAndUpdate kullanarak aynı refresh tokenın
    // iki kez kullanılmasını engelliyoruz.
    const currentToken =
      await RefreshToken.findOneAndUpdate(
        {
          tokenHash: currentTokenHash,
          revokedAt: null,
          expiresAt: {
            $gt: now,
          },
        },
        {
          $set: {
            revokedAt: now,
            replacedByTokenHash: nextTokenHash,
          },
        },
        {
          new: false,
        }
      ).populate("user");

    if (!currentToken || !currentToken.user) {
      clearRefreshCookie(res);

      throw new AppError(
        "Oturum geçersiz veya süresi dolmuş.",
        401
      );
    }

    const user = currentToken.user;

    if (user.status !== "active") {
      clearRefreshCookie(res);

      throw new AppError(
        "Kullanıcı hesabı aktif değil.",
        403
      );
    }

    const expiresAt = getRefreshTokenExpiry();

    await saveRefreshToken({
      user,
      tokenHash: nextTokenHash,
      expiresAt,
      req,
    });

    res.cookie(
      refreshCookieName,
      nextRawRefreshToken,
      getRefreshCookieOptions()
    );

    const accessToken = createAccessToken(user);

    res.status(200).json({
      success: true,

      data: {
        accessToken,
      },
    });
  }
);

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken =
    req.cookies?.[refreshCookieName];

  if (rawRefreshToken) {
    const tokenHash =
      hashRefreshToken(rawRefreshToken);

    await RefreshToken.updateOne(
      {
        tokenHash,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      }
    );
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Oturumunuz güvenli şekilde kapatıldı.",
  });
});

export const getCurrentUser = asyncHandler(
  async (req, res) => {
    res.status(200).json({
      success: true,

      data: {
        user: serializeUser(req.user),
      },
    });
  }
);
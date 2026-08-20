import {
  Bell,
  Flag,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquareText,
  ShieldCheck,
  Settings,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  resendEmailVerification,
} from "../services/authService";
import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Container from "../components/common/Container";
import ExpertBadge from "../components/forum/ExpertBadge";
import {
  useSiteSettings,
} from "../context/SiteSettingsContext";
import { useAuth } from "../context/AuthContext";

import {
  getMyForumNotifications,
} from "../services/accountForumService";

const roleLabels = {
  member: "Üye",
  moderator: "Moderatör",
  contentEditor:
    "İçerik editörü",
  financeManager:
    "Bağış yöneticisi",
  admin: "Yönetici",
  superAdmin:
    "Süper yönetici",
};

const AccountPage = () => {
  const {
  settings,
} = useSiteSettings();

const isForumEnabled =
  settings.features
    .forumEnabled;
  const navigate =
    useNavigate();

    const [
  verificationMessage,
  setVerificationMessage,
] = useState("");

const [
  verificationError,
  setVerificationError,
] = useState("");

const [
  isSendingVerification,
  setIsSendingVerification,
] = useState(false);

  const {
    user,
    logout,
  } = useAuth();

  useEffect(() => {
    document.title =
      "Hesabım | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const notificationsQuery =
    useQuery({
      queryKey: [
        "my-forum-notifications",
        "account-summary",
      ],
enabled:
  isForumEnabled,
      queryFn: () =>
        getMyForumNotifications({
          page: 1,
          limit: 1,
        }),

      retry: false,
    });

  const unreadCount =
    notificationsQuery.data
      ?.unreadCount || 0;

  const handleLogout =
    async () => {
      await logout();

      navigate("/", {
        replace: true,
      });
    };

    const handleResendVerification =
  async () => {
    setVerificationMessage("");
    setVerificationError("");
    setIsSendingVerification(
      true
    );

    try {
      const response =
        await resendEmailVerification();

      setVerificationMessage(
        response.message
      );
    } catch (error) {
      setVerificationError(
        error.message ||
          "E-posta gönderilemedi."
      );
    } finally {
      setIsSendingVerification(
        false
      );
    }
  };

  return (
    <section className="account-page">
      <Container>
        <div className="account-page__heading">
          <p>Üye alanı</p>

          <h1>
            Hoş geldiniz,{" "}
            {user.firstName}.
          </h1>

          <span>
            Hesap bilgilerinizi,
            forum hareketlerinizi ve
            bildirimlerinizi bu
            alandan takip
            edebilirsiniz.
          </span>
        </div>

        <div className="account-summary">
          <div className="account-summary__avatar">
            <UserRound size={31} />
          </div>

         <div className="account-summary__identity">
  <h2>
    {user.fullName}
  </h2>

  <p>
    <Mail size={17} />
    {user.email}
  </p>

  {user.expertProfile
    ?.isVerified && (
    <div className="account-expert-profile">
      <ExpertBadge
        profile={
          user.expertProfile
        }
      />

      <strong>
        {
          user.expertProfile
            .area
        }
      </strong>

      {user.expertProfile
        .bio && (
        <small>
          {
            user.expertProfile
              .bio
          }
        </small>
      )}
    </div>
  )}
</div>

          <div className="account-summary__status">
            <span>
              <ShieldCheck
                size={17}
              />

              {roleLabels[
                user.role
              ] || user.role}
            </span>

            <span>
  E-posta:{" "}
  {user.isEmailVerified
    ? "Doğrulandı"
    : "Doğrulama bekliyor"}
</span>

{!user.isEmailVerified && (
  <button
    type="button"
    className="account-verify-button"
    disabled={
      isSendingVerification
    }
    onClick={
      handleResendVerification
    }
  >
    {isSendingVerification
      ? "Gönderiliyor..."
      : "Doğrulama E-postasını Gönder"}
  </button>
)}

{verificationMessage && (
  <small className="account-verification-message">
    {verificationMessage}
  </small>
)}

{verificationError && (
  <small className="account-verification-error">
    {verificationError}
  </small>
)}
          </div>

          <button
            type="button"
            className="account-logout"
            onClick={
              handleLogout
            }
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>

      <div className="account-navigation">
        <Link
  to="/hesabim/ayarlar"
  className="account-navigation__item"
>
  <div className="account-navigation__icon">
    <Settings size={23} />
  </div>

  <div>
    <strong>
      Hesap Ayarları
    </strong>

    <span>
      Profilinizi, şifrenizi ve
      e-posta tercihlerinizi
      yönetin.
    </span>
  </div>
</Link>
  <Link
    to="/hesabim/taleplerim"
    className="account-navigation__item"
  >
    <div className="account-navigation__icon">
      <MessageSquareText
        size={23}
      />
    </div>

    <div>
      <strong>
        Taleplerim
      </strong>

      <span>
        Gönderdiğiniz taleplerin
        durumunu ve yönetimin
        yanıtlarını takip edin.
      </span>
    </div>
  </Link>

  {isForumEnabled && (
    <>
      <Link
        to="/hesabim/forum-hareketlerim"
        className="account-navigation__item"
      >
        <div className="account-navigation__icon">
          <MessageCircle
            size={23}
          />
        </div>

        <div>
          <strong>
            Forum Hareketlerim
          </strong>

          <span>
            Açtığınız konuları
            ve yazdığınız yanıtları
            görüntüleyin.
          </span>
        </div>
      </Link>

      <Link
        to="/hesabim/forum-bildirimlerim"
        className="account-navigation__item account-navigation__item--notification"
      >
        <div className="account-navigation__icon">
          <Bell size={23} />
        </div>

        <div>
          <strong>
            Forum Bildirimlerim
          </strong>

          <span>
            Yanıtları, cevapları
            ve bildirim sonuçlarını
            takip edin.
          </span>
        </div>

        {unreadCount > 0 && (
          <span className="account-navigation__badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </Link>

      <Link
        to="/hesabim/bildirdigim-icerikler"
        className="account-navigation__item"
      >
        <div className="account-navigation__icon">
          <Flag size={23} />
        </div>

        <div>
          <strong>
            Bildirdiğim İçerikler
          </strong>

          <span>
            Daha önce bildirdiğiniz
            konuların ve yanıtların
            durumunu takip edin.
          </span>
        </div>
      </Link>
    </>
  )}
</div>
      </Container>
    </section>
  );
};

export default AccountPage;
import {
  Bell,
  LogOut,
  Mail,
  MessageCircle,
  ShieldCheck,
  Flag,
  UserRound,
} from "lucide-react";

import { useEffect } from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Container from "../components/common/Container";
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
  const navigate =
    useNavigate();

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
                ve yazdığınız
                yanıtları
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
                ve bildirim
                sonuçlarını takip
                edin.
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
        </div>
      </Container>
    </section>
  );
};

export default AccountPage;
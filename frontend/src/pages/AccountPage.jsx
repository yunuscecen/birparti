import {
  LogOut,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useEffect } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";

const roleLabels = {
  member: "Üye",
  moderator: "Moderatör",
  contentEditor: "İçerik editörü",
  financeManager: "Bağış yöneticisi",
  admin: "Yönetici",
  superAdmin: "Süper yönetici",
};

const AccountPage = () => {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  useEffect(() => {
    document.title = "Hesabım | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  const handleLogout = async () => {
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
            Hoş geldiniz, {user.firstName}.
          </h1>

          <span>
            Hesap bilgilerinizi ve forum
            hareketlerinizi bu alandan
            yönetebilirsiniz.
          </span>
        </div>

        <div className="account-summary">
          <div className="account-summary__avatar">
            <UserRound size={31} />
          </div>

          <div className="account-summary__identity">
            <h2>{user.fullName}</h2>

            <p>
              <Mail size={17} />
              {user.email}
            </p>
          </div>

          <div className="account-summary__status">
            <span>
              <ShieldCheck size={17} />

              {roleLabels[user.role] ||
                user.role}
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
            onClick={handleLogout}
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
              <MessageCircle size={23} />
            </div>

            <div>
              <strong>
                Forum Hareketlerim
              </strong>

              <span>
                Açtığınız konuları ve
                yazdığınız yanıtları
                görüntüleyin.
              </span>
            </div>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default AccountPage;
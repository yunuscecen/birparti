import {
  ArrowLeft,
  KeyRound,
  Mail,
  Save,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  useAuth,
} from "../context/AuthContext";

import {
  changeCurrentUserPassword,
  updateCurrentUserMarketingPreference,
  updateCurrentUserProfile,
} from "../services/authService";

const getErrorMessage = (
  error,
  fallback
) =>
  error?.details?.[0]
    ?.message ||
  error?.message ||
  fallback;

const emptyPasswordForm = {
  currentPassword: "",
  password: "",
  passwordConfirm: "",
};

const AccountSettingsPage =
  () => {
    const navigate =
      useNavigate();

    const {
      user,
      logout,
      reloadUser,
    } = useAuth();

    const [
      profileForm,
      setProfileForm,
    ] = useState({
      firstName:
        user.firstName || "",
      lastName:
        user.lastName || "",
    });

    const [
      marketingEmails,
      setMarketingEmails,
    ] = useState(
      Boolean(
        user.marketingEmailsEnabled
      )
    );

    const [
      passwordForm,
      setPasswordForm,
    ] = useState(
      emptyPasswordForm
    );

    const [
      profileFeedback,
      setProfileFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    const [
      marketingFeedback,
      setMarketingFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    const [
      passwordFeedback,
      setPasswordFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    useEffect(() => {
      document.title =
        "Hesap Ayarları | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const profileMutation =
      useMutation({
        mutationFn:
          updateCurrentUserProfile,

        onSuccess:
          async (response) => {
            await reloadUser();

            setProfileFeedback({
              type: "success",
              message:
                response.message,
            });
          },

        onError: (error) => {
          setProfileFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Profil güncellenemedi."
              ),
          });
        },
      });

    const marketingMutation =
      useMutation({
        mutationFn:
          updateCurrentUserMarketingPreference,

        onSuccess:
          async (response) => {
            await reloadUser();

            setMarketingFeedback({
              type: "success",
              message:
                response.message,
            });
          },

        onError: (error) => {
          setMarketingFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "E-posta tercihi güncellenemedi."
              ),
          });
        },
      });

    const passwordMutation =
      useMutation({
        mutationFn:
          changeCurrentUserPassword,

        onSuccess:
          async (response) => {
            setPasswordFeedback({
              type: "success",
              message:
                response.message,
            });

            setPasswordForm(
              emptyPasswordForm
            );

            await new Promise(
              (resolve) => {
                window.setTimeout(
                  resolve,
                  1200
                );
              }
            );

            await logout();

            navigate("/giris", {
              replace: true,
            });
          },

        onError: (error) => {
          setPasswordFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Şifre değiştirilemedi."
              ),
          });
        },
      });

    const handleProfileSubmit =
      (event) => {
        event.preventDefault();

        setProfileFeedback({
          type: "",
          message: "",
        });

        profileMutation.mutate(
          profileForm
        );
      };

    const handleMarketingSubmit =
      (event) => {
        event.preventDefault();

        setMarketingFeedback({
          type: "",
          message: "",
        });

        marketingMutation.mutate(
          marketingEmails
        );
      };

    const handlePasswordSubmit =
      (event) => {
        event.preventDefault();

        setPasswordFeedback({
          type: "",
          message: "",
        });

        passwordMutation.mutate(
          passwordForm
        );
      };

    return (
      <section className="account-settings-page">
        <Container>
          <Link
            to="/hesabim"
            className="account-settings-back"
          >
            <ArrowLeft
              size={18}
            />

            Hesabıma Dön
          </Link>

          <div className="account-settings-heading">
            <p>
              Hesabım
            </p>

            <h1>
              Hesap Ayarları
            </h1>

            <span>
              Profil bilgilerinizi,
              e-posta tercihlerinizi ve
              şifrenizi buradan
              yönetebilirsiniz.
            </span>
          </div>

          <div className="account-settings-grid">
            <form
              className="account-settings-card"
              onSubmit={
                handleProfileSubmit
              }
            >
              <div className="account-settings-card__heading">
                <UserRound
                  size={22}
                />

                <div>
                  <p>
                    Profil
                  </p>

                  <h2>
                    Kişisel Bilgiler
                  </h2>
                </div>
              </div>

              <div className="account-settings-form-row">
                <label>
                  <span>
                    Ad
                  </span>

                  <input
                    value={
                      profileForm.firstName
                    }
                    onChange={(
                      event
                    ) =>
                      setProfileForm(
                        (current) => ({
                          ...current,

                          firstName:
                            event.target
                              .value,
                        })
                      )
                    }
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </label>

                <label>
                  <span>
                    Soyad
                  </span>

                  <input
                    value={
                      profileForm.lastName
                    }
                    onChange={(
                      event
                    ) =>
                      setProfileForm(
                        (current) => ({
                          ...current,

                          lastName:
                            event.target
                              .value,
                        })
                      )
                    }
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </label>
              </div>

              <label>
                <span>
                  E-posta
                </span>

                <input
                  value={
                    user.email
                  }
                  disabled
                />
              </label>

              <p className="account-settings-note">
                E-posta adresi güvenlik
                nedeniyle bu alandan
                değiştirilemez.
              </p>

              {profileFeedback
                .message && (
                <div
                  className={`account-settings-feedback account-settings-feedback--${profileFeedback.type}`}
                >
                  {
                    profileFeedback
                      .message
                  }
                </div>
              )}

              <button
                type="submit"
                className="account-settings-save"
                disabled={
                  profileMutation.isPending
                }
              >
                <Save size={17} />

                {profileMutation.isPending
                  ? "Kaydediliyor..."
                  : "Profili Kaydet"}
              </button>
            </form>

            <form
              className="account-settings-card"
              onSubmit={
                handleMarketingSubmit
              }
            >
              <div className="account-settings-card__heading">
                <Mail size={22} />

                <div>
                  <p>
                    İletişim
                  </p>

                  <h2>
                    Duyuru E-postaları
                  </h2>
                </div>
              </div>

              <label className="account-settings-toggle">
                <input
                  type="checkbox"
                  checked={
                    marketingEmails
                  }
                  onChange={(
                    event
                  ) =>
                    setMarketingEmails(
                      event.target
                        .checked
                    )
                  }
                />

                <span className="account-settings-toggle__control" />

                <span>
                  <strong>
                    Duyuru e-postalarını
                    almak istiyorum
                  </strong>

                  <small>
                    Proje, etkinlik ve
                    önemli gelişme
                    duyuruları
                    gönderilebilir.
                  </small>
                </span>
              </label>

              <p className="account-settings-note">
                Sistem ve güvenlik
                e-postaları bu tercihten
                bağımsızdır.
              </p>

              {marketingFeedback
                .message && (
                <div
                  className={`account-settings-feedback account-settings-feedback--${marketingFeedback.type}`}
                >
                  {
                    marketingFeedback
                      .message
                  }
                </div>
              )}

              <button
                type="submit"
                className="account-settings-save"
                disabled={
                  marketingMutation.isPending
                }
              >
                <Save size={17} />

                {marketingMutation.isPending
                  ? "Kaydediliyor..."
                  : "Tercihi Kaydet"}
              </button>
            </form>

            <form
              className="account-settings-card account-settings-card--password"
              onSubmit={
                handlePasswordSubmit
              }
            >
              <div className="account-settings-card__heading">
                <KeyRound
                  size={22}
                />

                <div>
                  <p>
                    Güvenlik
                  </p>

                  <h2>
                    Şifre Değiştir
                  </h2>
                </div>
              </div>

              <div className="account-settings-password-grid">
                <label>
                  <span>
                    Mevcut şifre
                  </span>

                  <input
                    type="password"
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setPasswordForm(
                        (current) => ({
                          ...current,

                          currentPassword:
                            event.target
                              .value,
                        })
                      )
                    }
                    autoComplete="current-password"
                    maxLength={72}
                    required
                  />
                </label>

                <label>
                  <span>
                    Yeni şifre
                  </span>

                  <input
                    type="password"
                    value={
                      passwordForm.password
                    }
                    onChange={(
                      event
                    ) =>
                      setPasswordForm(
                        (current) => ({
                          ...current,

                          password:
                            event.target
                              .value,
                        })
                      )
                    }
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>

                <label>
                  <span>
                    Yeni şifre tekrar
                  </span>

                  <input
                    type="password"
                    value={
                      passwordForm.passwordConfirm
                    }
                    onChange={(
                      event
                    ) =>
                      setPasswordForm(
                        (current) => ({
                          ...current,

                          passwordConfirm:
                            event.target
                              .value,
                        })
                      )
                    }
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
              </div>

              <p className="account-settings-note">
                Şifreniz en az bir küçük
                harf, büyük harf ve rakam
                içermelidir. Değişiklikten
                sonra yeniden giriş
                yapmanız gerekir.
              </p>

              {passwordFeedback
                .message && (
                <div
                  className={`account-settings-feedback account-settings-feedback--${passwordFeedback.type}`}
                >
                  {
                    passwordFeedback
                      .message
                  }
                </div>
              )}

              <button
                type="submit"
                className="account-settings-save"
                disabled={
                  passwordMutation.isPending
                }
              >
                <KeyRound
                  size={17}
                />

                {passwordMutation.isPending
                  ? "Değiştiriliyor..."
                  : "Şifreyi Değiştir"}
              </button>
            </form>
          </div>
        </Container>
      </section>
    );
  };

export default AccountSettingsPage;
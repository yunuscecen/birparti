import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";
import { registerFormSchema } from "../validators/authSchemas";

const RegisterPage = () => {
  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const navigate = useNavigate();

  const {
    register: createAccount,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(registerFormSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      acceptedTerms: false,
      acceptedPrivacy: false,
      acceptedMarketing: false,
    },
  });

  useEffect(() => {
    document.title = "Üye Ol | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      navigate("/hesabim", {
        replace: true,
      });
    }
  }, [
    isAuthReady,
    isAuthenticated,
    navigate,
  ]);

  const onSubmit = async (formData) => {
    setServerError("");

    try {
      await createAccount(formData);

      navigate("/hesabim", {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error.message ||
          "Üyelik oluşturulurken bir hata oluştu."
      );
    }
  };

  return (
    <section className="auth-page">
      <Container className="auth-page__container">
        <div className="auth-page__intro">
          <p className="auth-page__eyebrow">
            Birlik sensin
          </p>

          <h1>Fikre ortak olun.</h1>

          <p>
            Forum tartışmalarına katılmak,
            taleplerinizi takip etmek ve üye
            alanından yararlanmak için hesabınızı
            oluşturun.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card__heading">
            <h2>Üye Ol</h2>

            <p>
              Üyelik bilgilerinizi eksiksiz girin.
            </p>
          </div>

          {serverError && (
            <div
              className="auth-alert auth-alert--error"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="auth-form__row">
              <div className="auth-field">
                <label htmlFor="register-first-name">
                  Ad
                </label>

                <div
                  className={`auth-input ${
                    errors.firstName
                      ? "auth-input--error"
                      : ""
                  }`}
                >
                  <UserRound size={19} />

                  <input
                    id="register-first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Adınız"
                    {...register("firstName")}
                  />
                </div>

                {errors.firstName && (
                  <span className="auth-field__error">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="register-last-name">
                  Soyad
                </label>

                <div
                  className={`auth-input ${
                    errors.lastName
                      ? "auth-input--error"
                      : ""
                  }`}
                >
                  <UserRound size={19} />

                  <input
                    id="register-last-name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Soyadınız"
                    {...register("lastName")}
                  />
                </div>

                {errors.lastName && (
                  <span className="auth-field__error">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">
                E-posta adresi
              </label>

              <div
                className={`auth-input ${
                  errors.email
                    ? "auth-input--error"
                    : ""
                }`}
              >
                <Mail size={19} />

                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@eposta.com"
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <span className="auth-field__error">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="auth-form__row">
              <div className="auth-field">
                <label htmlFor="register-password">
                  Şifre
                </label>

                <div
                  className={`auth-input ${
                    errors.password
                      ? "auth-input--error"
                      : ""
                  }`}
                >
                  <LockKeyhole size={19} />

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Güçlü bir şifre"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    className="auth-input__action"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Şifreyi gizle"
                        : "Şifreyi göster"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="auth-field__error">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="register-password-confirm">
                  Şifre tekrarı
                </label>

                <div
                  className={`auth-input ${
                    errors.passwordConfirm
                      ? "auth-input--error"
                      : ""
                  }`}
                >
                  <LockKeyhole size={19} />

                  <input
                    id="register-password-confirm"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Şifrenizi tekrar girin"
                    {...register("passwordConfirm")}
                  />
                </div>

                {errors.passwordConfirm && (
                  <span className="auth-field__error">
                    {
                      errors.passwordConfirm
                        .message
                    }
                  </span>
                )}
              </div>
            </div>

            <div className="auth-checkboxes">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  {...register("acceptedTerms")}
                />

                <span>
                  Üyelik koşullarını kabul ediyorum.
                </span>
              </label>

              {errors.acceptedTerms && (
                <span className="auth-field__error">
                  {errors.acceptedTerms.message}
                </span>
              )}

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  {...register("acceptedPrivacy")}
                />

                <span>
                  Gizlilik ve kişisel veri metnini
                  kabul ediyorum.
                </span>
              </label>

              {errors.acceptedPrivacy && (
                <span className="auth-field__error">
                  {errors.acceptedPrivacy.message}
                </span>
              )}

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  {...register("acceptedMarketing")}
                />

                <span>
                  Duyuru ve bilgilendirme e-postaları
                  almak istiyorum.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-spinner auth-spinner--small" />
                  Hesap oluşturuluyor...
                </>
              ) : (
                <>
                  Üye Ol
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-card__switch">
            Zaten üye misiniz?{" "}
            <Link to="/giris">
              Giriş yapın
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default RegisterPage;
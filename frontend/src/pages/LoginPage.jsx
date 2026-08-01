import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";
import { loginFormSchema } from "../validators/authSchemas";
import {
  useSiteSettings,
} from "../context/SiteSettingsContext";

const LoginPage = () => {
  const {
  settings,
} = useSiteSettings();
  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
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
    resolver: zodResolver(loginFormSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    document.title = "Giriş Yap | Bir Parti";

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
      await login(formData);

      const destination =
        location.state?.from?.pathname ||
        "/hesabim";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error.message ||
          "Giriş yapılırken bir hata oluştu."
      );
    }
  };

  return (
    <section className="auth-page">
      <Container className="auth-page__container">
        <div className="auth-page__intro">
          <p className="auth-page__eyebrow">
            Üye hesabı
          </p>

          <h1>Tekrar hoş geldiniz.</h1>

          <p>
            Taleplerinizi takip etmek, forum
            tartışmalarına katılmak ve üye alanına
            erişmek için hesabınıza giriş yapın.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card__heading">
            <h2>Giriş Yap</h2>

            <p>
              Hesabınıza ait bilgileri girin.
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
            <div className="auth-field">
              <label htmlFor="login-email">
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
                  id="login-email"
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

            <div className="auth-field">
              <div className="auth-field__label-row">
                <label htmlFor="login-password">
                  Şifre
                </label>

                <Link to="/sifremi-unuttum">
                  Şifremi unuttum
                </Link>
              </div>

              <div
                className={`auth-input ${
                  errors.password
                    ? "auth-input--error"
                    : ""
                }`}
              >
                <LockKeyhole size={19} />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Şifreniz"
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

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-spinner auth-spinner--small" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {settings.features
  .registrationsEnabled && (
  <p className="auth-card__switch">
    Henüz üye değil misiniz?{" "}

    <Link to="/kayit">
      Üye olun
    </Link>
  </p>
)}
        </div>
      </Container>
    </section>
  );
};

export default LoginPage;
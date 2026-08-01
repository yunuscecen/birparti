import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  useParams,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  resetUserPassword,
} from "../services/authService";

import {
  resetPasswordFormSchema,
} from "../validators/authSchemas";

const ResetPasswordPage = () => {
  const { token } =
    useParams();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    serverError,
    setServerError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(
        resetPasswordFormSchema
      ),

    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  useEffect(() => {
    document.title =
      "Yeni Şifre Belirle | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const onSubmit = async (
    formData
  ) => {
    setServerError("");

    if (!token) {
      setServerError(
        "Şifre sıfırlama bağlantısı geçersiz."
      );

      return;
    }

    try {
      const response =
        await resetUserPassword({
          token,
          formData,
        });

      setSuccessMessage(
        response.message
      );
    } catch (error) {
      setServerError(
        error.message ||
          "Şifre değiştirilemedi."
      );
    }
  };

  return (
    <section className="auth-page">
      <Container className="auth-page__container">
        <div className="auth-page__intro">
          <p className="auth-page__eyebrow">
            Hesap güvenliği
          </p>

          <h1>
            Yeni şifrenizi belirleyin.
          </h1>

          <p>
            Daha önce kullanmadığınız,
            güçlü ve size özel bir
            şifre oluşturun.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card__heading">
            <h2>Yeni Şifre</h2>

            <p>
              En az 8 karakter, büyük
              harf, küçük harf ve rakam
              kullanın.
            </p>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert--error">
              {serverError}
            </div>
          )}

          {successMessage ? (
            <>
              <div className="auth-alert auth-alert--success">
                {successMessage}
              </div>

              <button
                type="button"
                className="auth-submit"
                onClick={() =>
                  window.location.assign(
                    "/giris"
                  )
                }
              >
                Giriş Yap
              </button>
            </>
          ) : (
            <form
              className="auth-form"
              onSubmit={
                handleSubmit(
                  onSubmit
                )
              }
              noValidate
            >
              <div className="auth-field">
                <label htmlFor="reset-password">
                  Yeni şifre
                </label>

                <div
                  className={`auth-input ${
                    errors.password
                      ? "auth-input--error"
                      : ""
                  }`}
                >
                  <LockKeyhole
                    size={19}
                  />

                  <input
                    id="reset-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    {...register(
                      "password"
                    )}
                  />

                  <button
                    type="button"
                    className="auth-input__action"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Şifreyi gizle"
                        : "Şifreyi göster"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="auth-field__error">
                    {
                      errors.password
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="reset-password-confirm">
                  Yeni şifre tekrarı
                </label>

                <div
                  className={`auth-input ${
                    errors.passwordConfirm
                      ? "auth-input--error"
                      : ""
                  }`}
                >
                  <LockKeyhole
                    size={19}
                  />

                  <input
                    id="reset-password-confirm"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    {...register(
                      "passwordConfirm"
                    )}
                  />
                </div>

                {errors.passwordConfirm && (
                  <span className="auth-field__error">
                    {
                      errors
                        .passwordConfirm
                        .message
                    }
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "Değiştiriliyor..."
                  : "Şifremi Değiştir"}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
};

export default ResetPasswordPage;
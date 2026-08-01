import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  requestPasswordReset,
} from "../services/authService";

import {
  forgotPasswordFormSchema,
} from "../validators/authSchemas";

const ForgotPasswordPage = () => {
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
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(
        forgotPasswordFormSchema
      ),

    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    document.title =
      "Şifremi Unuttum | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const onSubmit = async (
    formData
  ) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const response =
        await requestPasswordReset(
          formData
        );

      setSuccessMessage(
        response.message
      );

      reset();
    } catch (error) {
      setServerError(
        error.message ||
          "Şifre sıfırlama isteği gönderilemedi."
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
            Şifrenizi yenileyin.
          </h1>

          <p>
            Hesabınıza ait e-posta
            adresini girin. Kayıtlıysa
            size süreli bir şifre
            sıfırlama bağlantısı
            göndereceğiz.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card__heading">
            <h2>
              Şifremi Unuttum
            </h2>

            <p>
              Sıfırlama bağlantısı
              sınırlı süre geçerlidir.
            </p>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert--error">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="auth-alert auth-alert--success">
              {successMessage}
            </div>
          )}

          {!successMessage && (
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
                <label htmlFor="forgot-email">
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
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@eposta.com"
                    {...register(
                      "email"
                    )}
                  />
                </div>

                {errors.email && (
                  <span className="auth-field__error">
                    {
                      errors.email
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
                  ? "Gönderiliyor..."
                  : (
                    <>
                      Bağlantı Gönder
                      <Send size={18} />
                    </>
                  )}
              </button>
            </form>
          )}

          <p className="auth-card__switch">
            <Link to="/giris">
              <ArrowLeft
                size={16}
              />
              Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default ForgotPasswordPage;
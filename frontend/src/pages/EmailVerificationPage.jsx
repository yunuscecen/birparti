import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  verifyUserEmail,
} from "../services/authService";

const EmailVerificationPage = () => {
  const { token } = useParams();

  const {
    isAuthenticated,
    reloadUser,
  } = useAuth();

  const startedRef =
    useRef(false);

  const [status, setStatus] =
    useState("loading");

  const [message, setMessage] =
    useState(
      "E-posta adresiniz doğrulanıyor..."
    );

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const verify = async () => {
      try {
        const response =
          await verifyUserEmail(
            token
          );

        setStatus("success");

        setMessage(
          response.message ||
            "E-posta adresiniz doğrulandı."
        );

        if (isAuthenticated) {
          await reloadUser();
        }
      } catch (error) {
        setStatus("error");

        setMessage(
          error.message ||
            "Doğrulama bağlantısı geçersiz."
        );
      }
    };

    verify();
  }, [
    token,
    isAuthenticated,
    reloadUser,
  ]);

  return (
    <section className="auth-page-state">
      <div className="auth-card email-verification-card">
        {status === "loading" && (
          <>
            <span className="auth-spinner" />

            <h1>
              E-posta doğrulanıyor
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2
              size={54}
              color="#217844"
            />

            <h1>
              Doğrulama tamamlandı
            </h1>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle
              size={54}
              color="#b72f49"
            />

            <h1>
              Bağlantı kullanılamadı
            </h1>
          </>
        )}

        <p>{message}</p>

        {status !== "loading" && (
          <Link
            className="auth-submit"
            to={
              isAuthenticated
                ? "/hesabim"
                : "/giris"
            }
          >
            {isAuthenticated
              ? "Hesabıma Git"
              : "Giriş Yap"}
          </Link>
        )}
      </div>
    </section>
  );
};

export default EmailVerificationPage;
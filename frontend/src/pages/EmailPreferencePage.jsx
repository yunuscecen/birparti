import {
  CheckCircle2,
  MailX,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  unsubscribeMarketingEmails,
} from "../services/adminBulkEmailService";

const EmailPreferencePage = () => {
  const { token } =
    useParams();

  useEffect(() => {
    document.title =
      "E-posta Tercihi | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const unsubscribeMutation =
    useMutation({
      mutationFn: () =>
        unsubscribeMarketingEmails(
          token
        ),
    });

  const handleUnsubscribe =
    () => {
      if (
        !token ||
        unsubscribeMutation
          .isPending
      ) {
        return;
      }

      unsubscribeMutation.mutate();
    };

  return (
    <section className="auth-page-state">
      <div className="auth-card email-verification-card">
        {unsubscribeMutation.isSuccess ? (
          <>
            <CheckCircle2
              size={54}
              color="#217844"
            />

            <h1>
              Tercihiniz güncellendi
            </h1>

            <p>
              Duyuru ve tanıtım
              e-postası aboneliğiniz
              sonlandırıldı. Üyelik,
              güvenlik ve hizmetle ilgili
              zorunlu sistem bildirimleri
              gönderilmeye devam edebilir.
            </p>

            <Link
              to="/"
              className="auth-submit"
            >
              Ana Sayfaya Dön
            </Link>
          </>
        ) : unsubscribeMutation.isError ? (
          <>
            <XCircle
              size={54}
              color="#b72f49"
            />

            <h1>
              Tercih güncellenemedi
            </h1>

            <p>
              {unsubscribeMutation
                .error?.message ||
                "Bağlantı geçersiz veya artık kullanılamıyor."}
            </p>

            <Link
              to="/"
              className="auth-submit"
            >
              Ana Sayfaya Dön
            </Link>
          </>
        ) : (
          <>
            <ShieldCheck
              size={54}
              color="#2453ad"
            />

            <h1>
              Duyuru e-postalarından ayrıl
            </h1>

            <p>
              Bir Parti tarafından
              gönderilen duyuru ve tanıtım
              e-postalarını artık almak
              istemediğinizi onaylıyor
              musunuz?
            </p>

            <button
              type="button"
              className="auth-submit"
              onClick={
                handleUnsubscribe
              }
              disabled={
                !token ||
                unsubscribeMutation
                  .isPending
              }
            >
              {unsubscribeMutation.isPending ? (
                <>
                  <span className="auth-spinner auth-spinner--small" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <MailX size={19} />
                  Duyuru E-postalarından Ayrıl
                </>
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default EmailPreferencePage;
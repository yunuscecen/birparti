import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  Tag,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";
import {
  createAccountContactRequest,
  createContactRequest,
} from "../services/contactRequestService";

import {
  contactRequestSchema,
} from "../validators/contactRequestSchema";

import "../styles/contactPage.css";

const ContactPage = () => {
    const {
  user,
  isAuthenticated,
  isAuthReady,
} = useAuth();
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
  setValue,

  formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(
        contactRequestSchema
      ),

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      type: "",
      subject: "",
      message: "",
      privacyAccepted: false,
      website: "",
    },
  });

  useEffect(() => {
    document.title =
      "İletişim ve Talepler | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  useEffect(() => {
  if (!user) {
    return;
  }

  setValue(
    "fullName",
    user.fullName || ""
  );

  setValue(
    "email",
    user.email || ""
  );
}, [user, setValue]);

  const onSubmit = async (
    formData
  ) => {
    setServerError("");
    setSuccessMessage("");

    try {
     const createRequest =
  isAuthenticated
    ? createAccountContactRequest
    : createContactRequest;

const response =
  await createRequest(
    formData
  );

      setSuccessMessage(
        response.message ||
          "Talebiniz başarıyla alınmıştır."
      );

   reset({
  fullName:
    isAuthenticated
      ? user?.fullName || ""
      : "",

  email:
    isAuthenticated
      ? user?.email || ""
      : "",

  phone: "",
  type: "",
  subject: "",
  message: "",
  privacyAccepted: false,
  website: "",
});
    } catch (error) {
      setServerError(
        error.message ||
          "Talebiniz gönderilirken bir hata oluştu."
      );
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <Container>
          <p className="contact-hero__eyebrow">
            Görüşünüz değerli
          </p>

          <h1>
            İletişim ve Talepler
          </h1>

          <p className="contact-hero__description">
            Öneri, görüş, şikâyet
            veya teknik sorunlarınızı
            bize güvenli şekilde
            iletebilirsiniz.
          </p>
        </Container>
      </section>

      <section className="contact-body">
        <Container className="contact-layout">
          <aside className="contact-information">
            <div className="contact-information__heading">
              <p>Nasıl çalışır?</p>

              <h2>
                Talebinizi bize
                ulaştırın.
              </h2>
            </div>

            <div className="contact-information__items">
              <div className="contact-information__item">
                <MessageSquareText
                  size={22}
                />

                <div>
                  <strong>
                    Talebinizi yazın
                  </strong>

                  <span>
                    Konuyu ve mesajınızı
                    mümkün olduğunca açık
                    şekilde belirtin.
                  </span>
                </div>
              </div>

              <div className="contact-information__item">
                <ShieldCheck
                  size={22}
                />

                <div>
                  <strong>
                    Güvenli kayıt
                  </strong>

                  <span>
                    Bilgileriniz yalnızca
                    talebinizi değerlendirmek
                    için kullanılır.
                  </span>
                </div>
              </div>

              <div className="contact-information__item">
                <Clock3 size={22} />

                <div>
                  <strong>
                    İnceleme süreci
                  </strong>

                  <span>
                    Talebiniz yönetim
                    paneline iletilir ve
                    ilgili ekip tarafından
                    değerlendirilir.
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="contact-card">
            <div className="contact-card__heading">
              <p>Talep formu</p>

              <h2>
                Bize Ulaşın
              </h2>

              <span>
                Yıldızlı alanların
                doldurulması zorunludur.
              </span>
            </div>

            {serverError && (
              <div
                className="contact-alert contact-alert--error"
                role="alert"
              >
                {serverError}
              </div>
            )}

            {successMessage && (
              <div
                className="contact-alert contact-alert--success"
                role="status"
              >
                {successMessage}
              </div>
            )}

            <form
              className="contact-form"
              onSubmit={
                handleSubmit(
                  onSubmit
                )
              }
              noValidate
            >
              <div className="contact-form__row">
                <div className="contact-field">
                  <label htmlFor="contact-full-name">
                    Ad soyad *
                  </label>

                  <div
                    className={`contact-input ${
                      errors.fullName
                        ? "contact-input--error"
                        : ""
                    }`}
                  >
                    <UserRound
                      size={19}
                    />

                    <input
                      id="contact-full-name"
                      autoComplete="name"
                     placeholder="Adınız ve soyadınız"
readOnly={isAuthenticated}
{...register(
  "fullName"
)}
                    />
                  </div>

                  {errors.fullName && (
                    <span className="contact-field__error">
                      {
                        errors.fullName
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    E-posta adresi *
                  </label>

                  <div
                    className={`contact-input ${
                      errors.email
                        ? "contact-input--error"
                        : ""
                    }`}
                  >
                    <Mail size={19} />

                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                     placeholder="ornek@eposta.com"
readOnly={isAuthenticated}
{...register(
  "email"
)}
                    />
                  </div>

                  {errors.email && (
                    <span className="contact-field__error">
                      {
                        errors.email
                          .message
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="contact-form__row">
                <div className="contact-field">
                  <label htmlFor="contact-phone">
                    Telefon
                  </label>

                  <div
                    className={`contact-input ${
                      errors.phone
                        ? "contact-input--error"
                        : ""
                    }`}
                  >
                    <Phone size={19} />

                    <input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+90 5..."
                      {...register(
                        "phone"
                      )}
                    />
                  </div>

                  {errors.phone && (
                    <span className="contact-field__error">
                      {
                        errors.phone
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-type">
                    Talep türü *
                  </label>

                  <div
                    className={`contact-input ${
                      errors.type
                        ? "contact-input--error"
                        : ""
                    }`}
                  >
                    <Tag size={19} />

                    <select
                      id="contact-type"
                      {...register(
                        "type"
                      )}
                    >
                      <option value="">
                        Talep türünü seçin
                      </option>

                      <option value="suggestion">
                        Öneri
                      </option>

                      <option value="opinion">
                        Görüş
                      </option>

                      <option value="complaint">
                        Şikâyet
                      </option>

                      <option value="technical">
                        Teknik sorun
                      </option>

                      <option value="other">
                        Diğer
                      </option>
                    </select>
                  </div>

                  {errors.type && (
                    <span className="contact-field__error">
                      {
                        errors.type
                          .message
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">
                  Konu *
                </label>

                <div
                  className={`contact-input ${
                    errors.subject
                      ? "contact-input--error"
                      : ""
                  }`}
                >
                  <MessageSquareText
                    size={19}
                  />

                  <input
                    id="contact-subject"
                    placeholder="Talebinizin konusu"
                    maxLength={160}
                    {...register(
                      "subject"
                    )}
                  />
                </div>

                {errors.subject && (
                  <span className="contact-field__error">
                    {
                      errors.subject
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  Mesajınız *
                </label>

                <textarea
                  id="contact-message"
                  className={
                    errors.message
                      ? "contact-textarea contact-textarea--error"
                      : "contact-textarea"
                  }
                  rows={8}
                  maxLength={5000}
                  placeholder="Talebinizi ayrıntılı şekilde yazın..."
                  {...register(
                    "message"
                  )}
                />

                {errors.message && (
                  <span className="contact-field__error">
                    {
                      errors.message
                        .message
                    }
                  </span>
                )}
              </div>

              <div
                className="contact-honeypot"
                aria-hidden="true"
              >
                <label htmlFor="contact-website">
                  Website
                </label>

                <input
                  id="contact-website"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register(
                    "website"
                  )}
                />
              </div>

              <div>
                <label className="contact-checkbox">
                  <input
                    type="checkbox"
                    {...register(
                      "privacyAccepted"
                    )}
                  />

                  <span>
                    Gizlilik ve kişisel
                    veri bilgilendirmesini
                    okudum ve kabul
                    ediyorum.
                  </span>
                </label>

                {errors.privacyAccepted && (
                  <span className="contact-field__error">
                    {
                      errors
                        .privacyAccepted
                        .message
                    }
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="contact-submit"
               disabled={
  isSubmitting ||
  !isAuthReady
}
              >
                {isSubmitting ? (
                  <>
                    <span className="auth-spinner auth-spinner--small" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    Talebi Gönder
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ContactPage;
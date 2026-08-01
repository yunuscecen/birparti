import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  Mail,
  MessageSquareText,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getAdminContactRequestById,
  updateAdminContactRequest,
} from "../../services/adminContactRequestService";

const statusLabels = {
  new: "Yeni",
  inReview: "İnceleniyor",
  answered: "Yanıtlandı",
  closed: "Kapatıldı",
  spam: "Spam",
};

const typeLabels = {
  suggestion: "Öneri",
  opinion: "Görüş",
  complaint: "Şikâyet",
  technical: "Teknik sorun",
  other: "Diğer",
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
};

const AdminContactRequestDetailPage =
  () => {
    const { requestId } =
      useParams();

    const queryClient =
      useQueryClient();

    const [
      status,
      setStatus,
    ] = useState("new");

    const [
      priority,
      setPriority,
    ] = useState("normal");

    const [
      adminNote,
      setAdminNote,
    ] = useState("");
const [
  publicResponse,
  setPublicResponse,
] = useState("");
    const [
      isArchived,
      setIsArchived,
    ] = useState(false);

    const [
      feedback,
      setFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    useEffect(() => {
      document.title =
        "Talep Detayı | Bir Parti Yönetim";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const requestQuery =
      useQuery({
        queryKey: [
          "admin-contact-request",
          requestId,
        ],

        queryFn: () =>
          getAdminContactRequestById(
            requestId
          ),

        enabled:
          Boolean(requestId),

        retry: false,
      });

    const request =
      requestQuery.data
        ?.request;

    useEffect(() => {
      if (!request) {
        return;
      }

      setStatus(
        request.status ||
          "new"
      );

      setPriority(
        request.priority ||
          "normal"
      );

      setAdminNote(
        request.adminNote ||
          ""
      );
      setPublicResponse(
  request.publicResponse ||
    ""
);

      setIsArchived(
        Boolean(
          request.isArchived
        )
      );
    }, [request]);

    const updateMutation =
      useMutation({
        mutationFn:
          updateAdminContactRequest,

        onSuccess: async () => {
          setFeedback({
            type: "success",
            message:
              "Talep bilgileri güncellendi.",
          });

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [
                "admin-contact-request",
                requestId,
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "admin-contact-requests",
              ],
            }),
          ]);
        },

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              error.message ||
              "Talep güncellenemedi.",
          });
        },
      });

    const handleSubmit = (
      event
    ) => {
      event.preventDefault();

      setFeedback({
        type: "",
        message: "",
      });

      updateMutation.mutate({
        requestId,

       formData: {
  status,
  priority,

  publicResponse:
    publicResponse.trim(),

  adminNote:
    adminNote.trim(),

  isArchived,
},
      });
    };

    if (
      requestQuery.isLoading
    ) {
      return (
        <div className="admin-state">
          <span className="auth-spinner" />

          <p>
            Talep bilgileri
            yükleniyor...
          </p>
        </div>
      );
    }

    if (
      requestQuery.isError ||
      !request
    ) {
      return (
        <div className="admin-state">
          <h1>
            Talep bulunamadı.
          </h1>

          <p>
            {requestQuery.error
              ?.message ||
              "Talep kaldırılmış veya erişilemiyor olabilir."}
          </p>

          <Link
            to="/admin/talepler"
            className="admin-secondary-button"
          >
            <ArrowLeft
              size={17}
            />

            Taleplere Dön
          </Link>
        </div>
      );
    }

    return (
      <div className="admin-page">
        <div className="admin-page__heading admin-contact-detail-heading">
          <div>
            <p>
              İletişim yönetimi
            </p>

            <h1>
              Talep Detayı
            </h1>
          </div>

          <Link
            to="/admin/talepler"
            className="admin-secondary-button"
          >
            <ArrowLeft
              size={17}
            />

            Taleplere Dön
          </Link>
        </div>

        {feedback.message && (
          <div
            className={`admin-feedback ${
              feedback.type ===
              "error"
                ? "admin-feedback--error"
                : ""
            }`}
          >
            {feedback.message}

            <button
              type="button"
              onClick={() =>
                setFeedback({
                  type: "",
                  message: "",
                })
              }
            >
              Kapat
            </button>
          </div>
        )}

        <div className="admin-contact-detail-grid">
          <div className="admin-contact-detail-stack">
            <section className="admin-panel-card">
              <div className="admin-panel-card__heading">
                <div>
                  <p>
                    Gönderen
                  </p>

                  <h2>
                    İletişim Bilgileri
                  </h2>
                </div>

                <span
                  className={`admin-contact-status admin-contact-status--${request.status}`}
                >
                  {statusLabels[
                    request.status
                  ] ||
                    request.status}
                </span>
              </div>

              <div className="admin-contact-info-grid">
                <div className="admin-contact-info-item">
                  <UserRound
                    size={19}
                  />

                  <div>
                    <span>
                      Ad soyad
                    </span>

                    <strong>
                      {
                        request.fullName
                      }
                    </strong>
                  </div>
                </div>

                <div className="admin-contact-info-item">
                  <Mail size={19} />

                  <div>
                    <span>
                      E-posta
                    </span>

                    <a
                      href={`mailto:${request.email}`}
                    >
                      {request.email}
                    </a>
                  </div>
                </div>

                <div className="admin-contact-info-item">
                  <Phone size={19} />

                  <div>
                    <span>
                      Telefon
                    </span>

                    {request.phone ? (
                      <a
                        href={`tel:${request.phone}`}
                      >
                        {
                          request.phone
                        }
                      </a>
                    ) : (
                      <strong>
                        Belirtilmedi
                      </strong>
                    )}
                  </div>
                </div>

                <div className="admin-contact-info-item">
                  <CalendarDays
                    size={19}
                  />

                  <div>
                    <span>
                      Gönderilme tarihi
                    </span>

                    <strong>
                      {formatDate(
                        request.createdAt
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__heading">
                <div>
                  <p>
                    {
                      typeLabels[
                        request.type
                      ] ||
                      request.type
                    }
                  </p>

                  <h2>
                    {
                      request.subject
                    }
                  </h2>
                </div>

                <MessageSquareText
                  size={22}
                />
              </div>

              <div className="admin-contact-message">
                {request.message}
              </div>
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__heading">
                <div>
                  <p>
                    Kayıt bilgileri
                  </p>

                  <h2>
                    İşlem Geçmişi
                  </h2>
                </div>
              </div>

              <dl className="admin-contact-timeline">
                <div>
                  <dt>
                    Gizlilik onayı
                  </dt>

                  <dd>
                    {formatDate(
                      request
                        .privacyAcceptedAt
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Yanıt tarihi
                  </dt>

                  <dd>
                    {formatDate(
                      request
                        .answeredAt
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Kapatılma tarihi
                  </dt>

                  <dd>
                    {formatDate(
                      request
                        .closedAt
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Arşivlenme tarihi
                  </dt>

                  <dd>
                    {formatDate(
                      request
                        .archivedAt
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <aside>
            <form
              className="admin-panel-card admin-contact-review"
              onSubmit={
                handleSubmit
              }
            >
              <div className="admin-panel-card__heading">
                <div>
                  <p>
                    Yönetim
                  </p>

                  <h2>
                    Talebi Güncelle
                  </h2>
                </div>
              </div>

              <div className="admin-form">
                <div className="admin-form-field">
                  <label htmlFor="contact-request-status">
                    Durum
                  </label>

                  <select
                    id="contact-request-status"
                    value={status}
                    onChange={(
                      event
                    ) =>
                      setStatus(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="new">
                      Yeni
                    </option>

                    <option value="inReview">
                      İnceleniyor
                    </option>

                    <option value="answered">
                      Yanıtlandı
                    </option>

                    <option value="closed">
                      Kapatıldı
                    </option>

                    <option value="spam">
                      Spam
                    </option>
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="contact-request-priority">
                    Öncelik
                  </label>

                  <select
                    id="contact-request-priority"
                    value={priority}
                    onChange={(
                      event
                    ) =>
                      setPriority(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="low">
                      Düşük
                    </option>

                    <option value="normal">
                      Normal
                    </option>

                    <option value="high">
                      Yüksek
                    </option>

                    <option value="urgent">
                      Acil
                    </option>
                  </select>
                </div>
<div className="admin-form-field">
  <label htmlFor="contact-request-public-response">
    Kullanıcıya yanıt
  </label>

  <textarea
    id="contact-request-public-response"
    value={publicResponse}
    onChange={(
      event
    ) =>
      setPublicResponse(
        event.target.value
      )
    }
    rows={8}
    maxLength={5000}
    placeholder="Kullanıcının Taleplerim sayfasında göreceği yanıtı yazın..."
  />

  <small>
    Bu alan kullanıcı
    tarafından görülebilir.
    {" "}
    {publicResponse.length}
    /5000 karakter
  </small>
</div>
                <div className="admin-form-field">
                  <label htmlFor="contact-request-note">
                    Yönetici notu
                  </label>

                  <textarea
                    id="contact-request-note"
                    value={adminNote}
                    onChange={(
                      event
                    ) =>
                      setAdminNote(
                        event.target
                          .value
                      )
                    }
                    rows={8}
                    maxLength={5000}
                    placeholder="Talep hakkında yalnızca yöneticilerin görebileceği not..."
                  />

                  <small>
                    {
                      adminNote.length
                    }
                    /5000 karakter
                  </small>
                </div>

                <label className="admin-contact-archive-toggle">
                  <input
                    type="checkbox"
                    checked={
                      isArchived
                    }
                    onChange={(
                      event
                    ) =>
                      setIsArchived(
                        event.target
                          .checked
                      )
                    }
                  />

                  {isArchived ? (
                    <ArchiveRestore
                      size={19}
                    />
                  ) : (
                    <Archive
                      size={19}
                    />
                  )}

                  <span>
                    <strong>
                      {isArchived
                        ? "Talep arşivde"
                        : "Talebi arşivle"}
                    </strong>

                    <small>
                      Arşivlenen talepler
                      aktif listede
                      gösterilmez.
                    </small>
                  </span>
                </label>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={
                    updateMutation
                      .isPending
                  }
                >
                  <Save size={17} />

                  {updateMutation
                    .isPending
                    ? "Kaydediliyor..."
                    : "Değişiklikleri Kaydet"}
                </button>

                {request
                  .lastUpdatedBy && (
                  <p className="admin-contact-reviewer">
                    Son işlem:{" "}
                    <strong>
                      {
                        request
                          .lastUpdatedBy
                          .firstName
                      }{" "}
                      {
                        request
                          .lastUpdatedBy
                          .lastName
                      }
                    </strong>
                  </p>
                )}
              </div>
        </form>
          </aside>
        </div>
      </div>
    );
  };

export default AdminContactRequestDetailPage;
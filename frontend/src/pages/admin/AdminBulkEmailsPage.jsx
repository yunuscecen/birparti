import {
  Mail,
  Pencil,
  Plus,
  Save,
  Send,
  Users,
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
  createAdminBulkEmailCampaign,
  getAdminBulkEmailCampaigns,
  getBulkEmailAudienceCount,
  sendAdminBulkEmailCampaign,
  sendAdminBulkEmailTest,
  updateAdminBulkEmailCampaign,
} from "../../services/adminBulkEmailService";

const emptyForm = {
  name: "",
  emailType: "announcement",
  subject: "",
  previewText: "",
  body: "",
  actionLabel: "",
  actionUrl: "",
  audienceRoles: [],
};

const roleOptions = [
  {
    value: "member",
    label: "Üyeler",
  },
  {
    value: "moderator",
    label: "Moderatörler",
  },
  {
    value: "contentEditor",
    label: "İçerik Editörleri",
  },
  {
    value: "financeManager",
    label: "Finans Yöneticileri",
  },
  {
    value: "admin",
    label: "Yöneticiler",
  },
  {
    value: "superAdmin",
    label: "Süper Yöneticiler",
  },
];

const statusLabels = {
  draft: "Taslak",
  sending: "Gönderiliyor",
  sent: "Gönderildi",
  failed: "Başarısız",
  partially_failed: "Kısmen Gönderildi",
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
};

const normalizeCampaign = (
  campaign
) => ({
  name: campaign.name || "",
  emailType:
    campaign.emailType ||
    "announcement",
  subject: campaign.subject || "",
  previewText:
    campaign.previewText || "",
  body: campaign.body || "",
  actionLabel:
    campaign.actionLabel || "",
  actionUrl:
    campaign.actionUrl || "",
  audienceRoles:
    campaign.audienceRoles || [],
});

const AdminBulkEmailsPage = () => {
  const queryClient =
    useQueryClient();

  const [page, setPage] =
    useState(1);

  const [formData, setFormData] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState("");

  const [
    editingStatus,
    setEditingStatus,
  ] = useState("draft");

  const [isDirty, setIsDirty] =
    useState(false);

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const [feedback, setFeedback] =
    useState("");

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    document.title =
      "Toplu E-posta | Bir Parti Yönetim";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const campaignsQuery =
    useQuery({
      queryKey: [
        "admin-bulk-emails",
        page,
      ],

      queryFn: () =>
        getAdminBulkEmailCampaigns({
          page,
        }),
    });

  const audienceQuery =
    useQuery({
      queryKey: [
        "admin-bulk-email-audience",
        formData.emailType,
        formData.audienceRoles,
      ],

      queryFn: () =>
        getBulkEmailAudienceCount({
          emailType:
            formData.emailType,

          roles:
            formData.audienceRoles,
        }),
    });

  const saveMutation =
    useMutation({
      mutationFn: (
        submittedForm
      ) => {
        if (editingId) {
          return updateAdminBulkEmailCampaign(
            {
              campaignId:
                editingId,

              formData:
                submittedForm,
            }
          );
        }

        return createAdminBulkEmailCampaign(
          submittedForm
        );
      },

      onSuccess: async (
        result
      ) => {
        setEditingId(
          result.campaign._id
        );

        setEditingStatus(
          result.campaign.status
        );

        setIsDirty(false);

        setFeedback(
          result.message ||
            "Taslak kaydedildi."
        );

        setFormError("");

        await queryClient.invalidateQueries(
          {
            queryKey: [
              "admin-bulk-emails",
            ],
          }
        );
      },

      onError: (error) => {
        setFeedback("");

        setFormError(
          error.message ||
            "Taslak kaydedilemedi."
        );
      },
    });

  const testMutation =
    useMutation({
      mutationFn: () =>
        sendAdminBulkEmailTest(
          editingId
        ),

      onSuccess: (result) => {
        setFormError("");

        setFeedback(
          result.message ||
            "Test e-postası gönderildi."
        );
      },

      onError: (error) => {
        setFeedback("");

        setFormError(
          error.message ||
            "Test e-postası gönderilemedi."
        );
      },
    });

  const sendMutation =
    useMutation({
      mutationFn: () =>
        sendAdminBulkEmailCampaign(
          editingId
        ),

      onSuccess: async (
        result
      ) => {
        setEditingStatus(
          result.campaign.status
        );

        setConfirmation("");
        setFormError("");

        setFeedback(
          result.message ||
            "Toplu e-posta gönderildi."
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              "admin-bulk-emails",
            ],
          }
        );
      },

      onError: async (error) => {
        setFeedback("");

        setFormError(
          error.message ||
            "Toplu e-posta gönderilemedi."
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              "admin-bulk-emails",
            ],
          }
        );
      },
    });

  const campaigns =
    campaignsQuery.data
      ?.campaigns || [];

  const pagination =
    campaignsQuery.data
      ?.pagination;

  const audienceCount =
    audienceQuery.data?.count ||
    0;

  const canUseSavedDraft =
    Boolean(editingId) &&
    !isDirty &&
    editingStatus ===
      "draft";

  const handleFieldChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setIsDirty(true);
    setFeedback("");
  };

  const handleRoleChange = (
    role
  ) => {
    setFormData(
      (current) => {
        const isSelected =
          current.audienceRoles.includes(
            role
          );

        return {
          ...current,

          audienceRoles:
            isSelected
              ? current.audienceRoles.filter(
                  (item) =>
                    item !== role
                )
              : [
                  ...current.audienceRoles,
                  role,
                ],
        };
      }
    );

    setIsDirty(true);
    setFeedback("");
  };

  const handleSave = (
    event
  ) => {
    event.preventDefault();

    setFeedback("");
    setFormError("");

    saveMutation.mutate(
      formData
    );
  };

  const handleNewCampaign =
    () => {
      setFormData(emptyForm);
      setEditingId("");
      setEditingStatus(
        "draft"
      );
      setIsDirty(false);
      setConfirmation("");
      setFeedback("");
      setFormError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const handleEditCampaign =
    (campaign) => {
      setFormData(
        normalizeCampaign(
          campaign
        )
      );

      setEditingId(
        campaign._id
      );

      setEditingStatus(
        campaign.status
      );

      setIsDirty(false);
      setConfirmation("");
      setFeedback("");
      setFormError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Üye iletişimi</p>

          <h1>
            Toplu E-posta
          </h1>
        </div>

        <span>
          Üyelere duyuru veya zorunlu
          sistem bilgilendirmesi gönderin.
        </span>
      </div>

      {feedback && (
        <div className="bulk-email-message bulk-email-message--success">
          {feedback}
        </div>
      )}

      {formError && (
        <div className="bulk-email-message bulk-email-message--error">
          {formError}
        </div>
      )}

      <div className="bulk-email-layout">
        <section className="admin-panel-card">
          <div className="admin-panel-card__heading bulk-email-card-heading">
            <div>
              <p>
                {editingId
                  ? "Taslak düzenleme"
                  : "Yeni kampanya"}
              </p>

              <h2>
                E-posta İçeriği
              </h2>
            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={
                handleNewCampaign
              }
            >
              <Plus size={17} />
              Yeni Taslak
            </button>
          </div>

          <form
            className="admin-form"
            onSubmit={handleSave}
          >
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="bulk-name">
                  Kampanya adı
                </label>

                <input
                  id="bulk-name"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Örnek: Ağustos proje duyurusu"
                  maxLength={120}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="bulk-type">
                  E-posta türü
                </label>

                <select
                  id="bulk-type"
                  name="emailType"
                  value={
                    formData.emailType
                  }
                  onChange={
                    handleFieldChange
                  }
                >
                  <option value="announcement">
                    Duyuru / Tanıtım
                  </option>

                  <option value="system">
                    Zorunlu Sistem Bildirimi
                  </option>
                </select>
              </div>
            </div>

            <div
              className={`bulk-email-type-warning ${
                formData.emailType ===
                "system"
                  ? "bulk-email-type-warning--system"
                  : ""
              }`}
            >
              {formData.emailType ===
              "announcement"
                ? "Yalnızca duyuru e-postalarına izin veren, aktif ve doğrulanmış üyelere gönderilir."
                : "Bu seçenek yalnızca güvenlik, üyelik veya hizmet değişikliği gibi zorunlu bildirimler içindir. Reklam ve tanıtım için kullanılmamalıdır."}
            </div>

            <div className="admin-form-field">
              <label htmlFor="bulk-subject">
                E-posta konusu
              </label>

              <input
                id="bulk-subject"
                name="subject"
                value={
                  formData.subject
                }
                onChange={
                  handleFieldChange
                }
                placeholder="Üyenin gelen kutusunda görünecek konu"
                maxLength={180}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="bulk-preview">
                Ön izleme yazısı
              </label>

              <input
                id="bulk-preview"
                name="previewText"
                value={
                  formData.previewText
                }
                onChange={
                  handleFieldChange
                }
                placeholder="E-posta uygulamasında konunun yanında görünür"
                maxLength={200}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="bulk-body">
                E-posta içeriği
              </label>

              <textarea
                id="bulk-body"
                name="body"
                value={
                  formData.body
                }
                onChange={
                  handleFieldChange
                }
                placeholder="Gönderilecek mesajı yazın..."
                rows={10}
                maxLength={20000}
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="bulk-action-label">
                  Buton yazısı
                </label>

                <input
                  id="bulk-action-label"
                  name="actionLabel"
                  value={
                    formData.actionLabel
                  }
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Örnek: Projeyi İncele"
                  maxLength={80}
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="bulk-action-url">
                  Buton bağlantısı
                </label>

                <input
                  id="bulk-action-url"
                  name="actionUrl"
                  value={
                    formData.actionUrl
                  }
                  onChange={
                    handleFieldChange
                  }
                  placeholder="/projelerimiz veya https://..."
                  maxLength={500}
                />
              </div>
            </div>

            <fieldset className="bulk-email-role-fieldset">
              <legend>
                Hedef üye rolleri
              </legend>

              <p>
                Hiçbir rol seçmezseniz
                uygun durumdaki tüm
                üyelere gönderilir.
              </p>

              <div className="bulk-email-role-grid">
                {roleOptions.map(
                  (role) => (
                    <label
                      className="admin-form-checkbox admin-form-checkbox--boxed"
                      key={
                        role.value
                      }
                    >
                      <input
                        type="checkbox"
                        checked={formData.audienceRoles.includes(
                          role.value
                        )}
                        onChange={() =>
                          handleRoleChange(
                            role.value
                          )
                        }
                      />

                      <span>
                        <strong>
                          {role.label}
                        </strong>
                      </span>
                    </label>
                  )
                )}
              </div>
            </fieldset>

            <div className="bulk-email-audience">
              <Users size={22} />

              <div>
                <span>
                  Tahmini alıcı
                </span>

                <strong>
                  {audienceQuery.isLoading
                    ? "Hesaplanıyor..."
                    : `${audienceCount} üye`}
                </strong>
              </div>
            </div>

            {isDirty &&
              editingId && (
                <div className="bulk-email-message bulk-email-message--warning">
                  İçerikte kaydedilmemiş
                  değişiklik var. Test veya
                  gerçek gönderimden önce
                  taslağı kaydedin.
                </div>
              )}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={
                  saveMutation.isPending ||
                  editingStatus !==
                    "draft"
                }
              >
                <Save size={17} />

                {saveMutation.isPending
                  ? "Kaydediliyor..."
                  : editingId
                    ? "Taslağı Güncelle"
                    : "Taslağı Kaydet"}
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                disabled={
                  !canUseSavedDraft ||
                  testMutation.isPending
                }
                onClick={() => {
                  setFeedback("");
                  setFormError("");
                  testMutation.mutate();
                }}
              >
                <Mail size={17} />

                {testMutation.isPending
                  ? "Gönderiliyor..."
                  : "Kendime Test Gönder"}
              </button>
            </div>

            {canUseSavedDraft && (
              <div className="bulk-email-send-confirmation">
                <div className="admin-form-field">
                  <label htmlFor="bulk-confirmation">
                    Gerçek gönderimi onaylamak
                    için GONDER yazın
                  </label>

                  <input
                    id="bulk-confirmation"
                    value={
                      confirmation
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmation(
                        event.target
                          .value
                      )
                    }
                    placeholder="GONDER"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="button"
                  className="bulk-email-send-button"
                  disabled={
                    confirmation !==
                      "GONDER" ||
                    audienceCount ===
                      0 ||
                    sendMutation.isPending
                  }
                  onClick={() => {
                    setFeedback("");
                    setFormError("");
                    sendMutation.mutate();
                  }}
                >
                  <Send size={18} />

                  {sendMutation.isPending
                    ? "Gönderim yapılıyor..."
                    : `${audienceCount} Üyeye Gönder`}
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <p>Gönderim görünümü</p>
            <h2>E-posta Ön İzleme</h2>
          </div>

          <div className="bulk-email-preview-wrapper">
            <article className="bulk-email-preview">
              <span className="bulk-email-preview__brand">
                BİR PARTİ
              </span>

              <h2>
                {formData.subject ||
                  "E-posta konusu"}
              </h2>

              <p>Merhaba Üyemiz,</p>

              <div className="bulk-email-preview__body">
                {formData.body ||
                  "E-posta içeriğiniz burada görünecek."}
              </div>

              {formData.actionLabel &&
                formData.actionUrl && (
                  <span className="bulk-email-preview__button">
                    {
                      formData.actionLabel
                    }
                  </span>
                )}

              {formData.emailType ===
                "announcement" && (
                <small>
                  Bu e-postanın altında
                  üyeye özel “Duyuru
                  e-postalarından ayrıl”
                  bağlantısı bulunacaktır.
                </small>
              )}
            </article>
          </div>
        </section>
      </div>

      <section className="admin-panel-card">
        <div className="admin-panel-card__heading">
          <p>Gönderim geçmişi</p>
          <h2>Kampanyalar</h2>
        </div>

        {campaignsQuery.isLoading ? (
          <div className="admin-state">
            <span className="auth-spinner" />
            <p>
              Kampanyalar yükleniyor...
            </p>
          </div>
        ) : campaignsQuery.isError ? (
          <div className="admin-state">
            <p>
              Kampanya kayıtları alınamadı.
            </p>

            <button
              type="button"
              onClick={() =>
                campaignsQuery.refetch()
              }
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kampanya</th>
                    <th>Tür</th>
                    <th>Durum</th>
                    <th>Alıcı</th>
                    <th>Gönderilen</th>
                    <th>Tarih</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map(
                    (campaign) => (
                      <tr
                        key={
                          campaign._id
                        }
                      >
                        <td>
                          <strong>
                            {
                              campaign.name
                            }
                          </strong>

                          <span>
                            {
                              campaign.subject
                            }
                          </span>
                        </td>

                        <td>
                          {campaign.emailType ===
                          "announcement"
                            ? "Duyuru"
                            : "Sistem"}
                        </td>

                        <td>
                          <span
                            className={`bulk-email-status bulk-email-status--${campaign.status}`}
                          >
                            {statusLabels[
                              campaign
                                .status
                            ] ||
                              campaign.status}
                          </span>
                        </td>

                        <td>
                          {
                            campaign.recipientCount
                          }
                        </td>

                        <td>
                          {
                            campaign.sentCount
                          }
                        </td>

                        <td>
                          {formatDate(
                            campaign.sentAt ||
                              campaign.createdAt
                          )}
                        </td>

                        <td>
                          {campaign.status ===
                          "draft" ? (
                            <div className="admin-inline-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditCampaign(
                                    campaign
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                                Düzenle
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {campaigns.length ===
                    0 && (
                    <tr>
                      <td colSpan="7">
                        Henüz kampanya
                        oluşturulmadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination &&
              pagination.totalPages >
                1 && (
                <div className="admin-pagination">
                  <button
                    type="button"
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current - 1
                      )
                    }
                  >
                    Önceki
                  </button>

                  <span>
                    <strong>
                      {page}
                    </strong>
                    /
                    {
                      pagination.totalPages
                    }
                  </span>

                  <button
                    type="button"
                    disabled={
                      page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1
                      )
                    }
                  >
                    Sonraki
                  </button>
                </div>
              )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminBulkEmailsPage;
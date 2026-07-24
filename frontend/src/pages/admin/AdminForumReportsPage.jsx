import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flag,
  MessageCircle,
  Search,
  ShieldCheck,
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

import { Link } from "react-router-dom";

import {
  getAdminForumReportOverview,
  getAdminForumReports,
  updateAdminForumReport,
} from "../../services/adminForumService";

const statusLabels = {
  pending: "Bekliyor",
  reviewed: "İncelendi",
  dismissed: "Reddedildi",
  action_taken: "İşlem Yapıldı",
};

const reasonLabels = {
  spam: "Spam veya reklam",
  harassment: "Taciz veya hakaret",
  hate: "Nefret söylemi",
  misinformation: "Yanıltıcı bilgi",
  personal_data:
    "Kişisel bilgi paylaşımı",
  other: "Diğer",
};

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data
      ?.message ||
    error?.message ||
    fallback
  );
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

const ReportReviewCard = ({
  report,
  isUpdating,
  onUpdate,
}) => {
  const [
    status,
    setStatus,
  ] = useState(
    report.status
  );

  const [
    resolutionNote,
    setResolutionNote,
  ] = useState(
    report.resolutionNote || ""
  );

  useEffect(() => {
    setStatus(report.status);

    setResolutionNote(
      report.resolutionNote || ""
    );
  }, [
    report.status,
    report.resolutionNote,
  ]);

  const publicTopicAvailable =
    report.topic &&
    [
      "open",
      "locked",
    ].includes(
      report.topic.status
    );

  const publicTargetUrl =
    report.targetType === "reply" &&
    report.reply?._id
      ? `/forum/${report.topic?.slug}#yanit-${report.reply._id}`
      : `/forum/${report.topic?.slug}`;

  return (
    <article className="admin-forum-report-card">
      <header className="admin-forum-report-card__header">
        <div>
          <span
            className={`admin-status admin-status--report-${report.status}`}
          >
            {statusLabels[
              report.status
            ] || report.status}
          </span>

          <span className="admin-forum-report-card__type">
            {report.targetType ===
            "topic"
              ? "Konu bildirimi"
              : "Yanıt bildirimi"}
          </span>
        </div>

        <span>
          {formatDate(
            report.createdAt
          )}
        </span>
      </header>

      <div className="admin-forum-report-card__content">
        <div className="admin-forum-report-card__people">
          <div>
            <span>
              Bildiren kullanıcı
            </span>

            <strong>
              {report.reporterInfo
                ?.name ||
                "Bilinmeyen kullanıcı"}
            </strong>

            <small>
              {report.reporterInfo
                ?.email || "—"}
            </small>
          </div>

          <div>
            <span>
              İçerik sahibi
            </span>

            <strong>
              {report.targetAuthorInfo
                ?.name ||
                "Bilinmeyen kullanıcı"}
            </strong>

            <small>
              {report.targetAuthorInfo
                ?.email || "—"}
            </small>
          </div>
        </div>

        <div className="admin-forum-report-card__target">
          <span>
            Bildirilen içerik
          </span>

          <h2>
            {report.topic?.title ||
              "Forum konusu bulunamadı"}
          </h2>

          {report.targetType ===
            "reply" &&
            report.reply?.body && (
              <blockquote>
                {report.reply.body}
              </blockquote>
            )}

          {report.targetType ===
            "topic" &&
            report.topic?.body && (
              <p>
                {report.topic.body
                  .length > 350
                  ? `${report.topic.body.slice(
                      0,
                      350
                    )}…`
                  : report.topic.body}
              </p>
            )}
        </div>

        <div className="admin-forum-report-card__reason">
          <span>
            Bildirim nedeni
          </span>

          <strong>
            {reasonLabels[
              report.reason
            ] || report.reason}
          </strong>

          <p>
            {report.description ||
              "Kullanıcı ek açıklama yazmadı."}
          </p>
        </div>

        <div className="admin-forum-report-card__links">
          {publicTopicAvailable && (
            <Link
              to={publicTargetUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-secondary-button"
            >
              <ExternalLink
                size={16}
              />

              Public İçeriği Aç
            </Link>
          )}

          {report.topic?._id && (
            <Link
              to={`/admin/forum/${report.topic._id}/moderasyon`}
              className="admin-secondary-button"
            >
              <ShieldCheck
                size={16}
              />

              İçeriği Yönet
            </Link>
          )}
        </div>
      </div>

      <footer className="admin-forum-report-card__review">
        <div className="admin-form-field">
          <label>
            Bildirim durumu
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >
            <option value="pending">
              Bekliyor
            </option>

            <option value="reviewed">
              İncelendi
            </option>

            <option value="dismissed">
              Reddedildi
            </option>

            <option value="action_taken">
              İşlem Yapıldı
            </option>
          </select>
        </div>

        <div className="admin-form-field admin-forum-report-card__note">
          <label>
            Yönetici notu
          </label>

          <textarea
            value={
              resolutionNote
            }
            onChange={(event) =>
              setResolutionNote(
                event.target.value
              )
            }
            rows={3}
            maxLength={1500}
            placeholder="İnceleme veya yapılan işlem hakkında not..."
          />

          <small>
            {
              resolutionNote.length
            }
            /1500 karakter
          </small>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          disabled={isUpdating}
          onClick={() =>
            onUpdate({
              reportId:
                report._id,
              status,
              resolutionNote:
                resolutionNote.trim(),
            })
          }
        >
          <ShieldCheck size={17} />

          {isUpdating
            ? "Kaydediliyor..."
            : "İncelemeyi Kaydet"}
        </button>

        {report.reviewedByInfo && (
          <span className="admin-forum-report-card__reviewer">
            Son işlem:{" "}
            <strong>
              {
                report
                  .reviewedByInfo
                  .name
              }
            </strong>
            {" · "}
            {formatDate(
              report.reviewedAt
            )}
          </span>
        )}
      </footer>
    </article>
  );
};

const AdminForumReportsPage =
  () => {
    const queryClient =
      useQueryClient();

    const [page, setPage] =
      useState(1);

    const [
      searchInput,
      setSearchInput,
    ] = useState("");

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      status,
      setStatus,
    ] = useState(
      "pending"
    );

    const [
      targetType,
      setTargetType,
    ] = useState("");

    const [
      reason,
      setReason,
    ] = useState("");

    const [
      feedback,
      setFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    useEffect(() => {
      document.title =
        "Forum Bildirimleri | Bir Parti Yönetim";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    useEffect(() => {
      const timeout =
        window.setTimeout(
          () => {
            setSearch(
              searchInput.trim()
            );

            setPage(1);
          },
          350
        );

      return () => {
        window.clearTimeout(
          timeout
        );
      };
    }, [searchInput]);

    const overviewQuery =
      useQuery({
        queryKey: [
          "admin-forum-report-overview",
        ],

        queryFn:
          getAdminForumReportOverview,
      });

    const reportsQuery =
      useQuery({
        queryKey: [
          "admin-forum-reports",
          page,
          search,
          status,
          targetType,
          reason,
        ],

        queryFn: () =>
          getAdminForumReports({
            page,
            search,
            status,
            targetType,
            reason,
          }),
      });

    const updateMutation =
      useMutation({
        mutationFn:
          updateAdminForumReport,

        onSuccess: async () => {
          setFeedback({
            type: "success",
            message:
              "Forum bildirimi güncellendi.",
          });

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [
                "admin-forum-reports",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "admin-forum-report-overview",
              ],
            }),
          ]);
        },

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Forum bildirimi güncellenemedi."
              ),
          });
        },
      });

    const overview =
      overviewQuery.data
        ?.overview || {
        totalReports: 0,
        pendingReports: 0,
        reviewedReports: 0,
        dismissedReports: 0,
        actionTakenReports: 0,
      };

    const reports =
      reportsQuery.data
        ?.reports || [];

    const pagination =
      reportsQuery.data
        ?.pagination;

    const handleUpdate = (
      formData
    ) => {
      updateMutation.mutate(
        formData
      );
    };

    return (
      <div className="admin-page">
        <div className="admin-page__heading">
          <div>
            <p>
              Forum moderasyonu
            </p>

            <h1>
              Forum Bildirimleri
            </h1>
          </div>

          <span>
            Kullanıcıların
            bildirdiği forum
            içeriklerini inceleyin.
          </span>
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

        <section className="admin-forum-report-overview">
          <article>
            <Flag size={20} />
            <span>Toplam</span>
            <strong>
              {overview.totalReports}
            </strong>
          </article>

          <article>
            <MessageCircle
              size={20}
            />
            <span>Bekliyor</span>
            <strong>
              {overview.pendingReports}
            </strong>
          </article>

          <article>
            <ShieldCheck
              size={20}
            />
            <span>İncelendi</span>
            <strong>
              {overview.reviewedReports}
            </strong>
          </article>

          <article>
            <span>Reddedildi</span>
            <strong>
              {overview.dismissedReports}
            </strong>
          </article>

          <article>
            <span>İşlem Yapıldı</span>
            <strong>
              {overview.actionTakenReports}
            </strong>
          </article>
        </section>

        <section className="admin-panel-card">
          <div className="admin-user-filters admin-forum-report-filters">
            <div className="admin-search">
              <Search size={19} />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Kullanıcı, konu veya içerikte ara..."
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm durumlar
              </option>

              <option value="pending">
                Bekliyor
              </option>

              <option value="reviewed">
                İncelendi
              </option>

              <option value="dismissed">
                Reddedildi
              </option>

              <option value="action_taken">
                İşlem Yapıldı
              </option>
            </select>

            <select
              value={targetType}
              onChange={(event) => {
                setTargetType(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm içerikler
              </option>

              <option value="topic">
                Konu
              </option>

              <option value="reply">
                Yanıt
              </option>
            </select>

            <select
              value={reason}
              onChange={(event) => {
                setReason(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm nedenler
              </option>

              {Object.entries(
                reasonLabels
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {reportsQuery.isLoading ? (
            <div className="admin-state">
              <span className="auth-spinner" />

              <p>
                Forum bildirimleri
                yükleniyor...
              </p>
            </div>
          ) : reportsQuery.isError ? (
            <div className="admin-state">
              <h2>
                Forum bildirimleri
                alınamadı.
              </h2>

              <button
                type="button"
                onClick={() =>
                  reportsQuery.refetch()
                }
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="admin-forum-report-list">
              {reports.map(
                (report) => (
                  <ReportReviewCard
                    key={
                      report._id
                    }
                    report={
                      report
                    }
                    isUpdating={
                      updateMutation.isPending
                    }
                    onUpdate={
                      handleUpdate
                    }
                  />
                )
              )}

              {reports.length ===
                0 && (
                <div className="admin-state">
                  <Flag size={27} />

                  <h2>
                    Bildirim
                    bulunamadı.
                  </h2>

                  <p>
                    Seçilen filtrelerle
                    eşleşen bir forum
                    bildirimi yok.
                  </p>
                </div>
              )}
            </div>
          )}

          {pagination &&
            pagination.totalPages >
              1 && (
              <div className="admin-pagination">
                <span>
                  Toplam{" "}
                  {
                    pagination.totalReports
                  }{" "}
                  bildirim
                </span>

                <div>
                  <button
                    type="button"
                    disabled={
                      !pagination.hasPreviousPage
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            current -
                              1,
                            1
                          )
                      )
                    }
                  >
                    <ChevronLeft
                      size={18}
                    />
                  </button>

                  <strong>
                    {pagination.page} /{" "}
                    {
                      pagination.totalPages
                    }
                  </strong>

                  <button
                    type="button"
                    disabled={
                      !pagination.hasNextPage
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1
                      )
                    }
                  >
                    <ChevronRight
                      size={18}
                    />
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>
    );
  };

export default AdminForumReportsPage;
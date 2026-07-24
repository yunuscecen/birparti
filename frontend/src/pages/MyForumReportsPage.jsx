import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Flag,
  MessageCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  getMyForumReports,
} from "../services/accountForumService";

const statusLabels = {
  pending: "İnceleme Bekliyor",
  reviewed: "İncelendi",
  dismissed: "İşlem Gerektirmedi",
  action_taken: "İşlem Yapıldı",
};

const reasonLabels = {
  spam: "Spam veya reklam",
  harassment: "Taciz veya hakaret",
  hate: "Nefret söylemi",
  misinformation:
    "Yanıltıcı bilgi",
  personal_data:
    "Kişisel bilgi paylaşımı",
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

const truncateText = (
  value,
  maximumLength = 280
) => {
  if (!value) {
    return "";
  }

  if (
    value.length <=
    maximumLength
  ) {
    return value;
  }

  return `${value.slice(
    0,
    maximumLength
  )}…`;
};

const MyForumReportsPage =
  () => {
    const [
      searchParams,
      setSearchParams,
    ] = useSearchParams();

    const page = Math.max(
      Number(
        searchParams.get(
          "sayfa"
        )
      ) || 1,
      1
    );

    const status =
      searchParams.get(
        "durum"
      ) || "";

    const targetType =
      searchParams.get(
        "icerik"
      ) || "";

    useEffect(() => {
      document.title =
        "Bildirdiğim İçerikler | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const reportsQuery =
      useQuery({
        queryKey: [
          "my-forum-reports",
          page,
          status,
          targetType,
        ],

        queryFn: () =>
          getMyForumReports({
            page,
            status,
            targetType,
          }),

        retry: false,
      });

    const reports =
      reportsQuery.data
        ?.reports || [];

    const overview =
      reportsQuery.data
        ?.overview || {
        total: 0,
        pending: 0,
        reviewed: 0,
        dismissed: 0,
        actionTaken: 0,
      };

    const pagination =
      reportsQuery.data
        ?.pagination;

    const updateParams = (
      updates
    ) => {
      const nextParams =
        new URLSearchParams(
          searchParams
        );

      Object.entries(
        updates
      ).forEach(
        ([key, value]) => {
          if (
            value !== "" &&
            value !== null &&
            value !== undefined
          ) {
            nextParams.set(
              key,
              String(value)
            );
          } else {
            nextParams.delete(
              key
            );
          }
        }
      );

      setSearchParams(
        nextParams
      );
    };

    return (
      <div className="forum-reports-page">
        <section className="forum-reports-hero">
          <Container>
            <p className="forum-reports-hero__eyebrow">
              Hesabım
            </p>

            <h1>
              Bildirdiğim İçerikler
            </h1>

            <p>
              Topluluk kurallarına
              aykırı olduğunu
              düşündüğünüz forum
              içerikleri için
              gönderdiğiniz bildirimleri
              buradan takip
              edebilirsiniz.
            </p>
          </Container>
        </section>

        <section className="forum-reports-content">
          <Container>
            <div className="forum-reports-overview">
              <article>
                <Flag size={20} />

                <span>
                  Toplam Bildirim
                </span>

                <strong>
                  {overview.total}
                </strong>
              </article>

              <article>
                <Clock size={20} />

                <span>
                  İnceleme Bekliyor
                </span>

                <strong>
                  {overview.pending}
                </strong>
              </article>

              <article>
                <ShieldCheck
                  size={20}
                />

                <span>
                  İncelendi
                </span>

                <strong>
                  {overview.reviewed}
                </strong>
              </article>

              <article>
                <XCircle size={20} />

                <span>
                  İşlem Gerektirmedi
                </span>

                <strong>
                  {overview.dismissed}
                </strong>
              </article>

              <article>
                <AlertTriangle
                  size={20}
                />

                <span>
                  İşlem Yapıldı
                </span>

                <strong>
                  {
                    overview.actionTaken
                  }
                </strong>
              </article>
            </div>

            <div className="forum-reports-toolbar">
              <div>
                <select
                  value={status}
                  onChange={(event) =>
                    updateParams({
                      durum:
                        event.target
                          .value,

                      sayfa: "",
                    })
                  }
                >
                  <option value="">
                    Tüm durumlar
                  </option>

                  <option value="pending">
                    İnceleme Bekliyor
                  </option>

                  <option value="reviewed">
                    İncelendi
                  </option>

                  <option value="dismissed">
                    İşlem Gerektirmedi
                  </option>

                  <option value="action_taken">
                    İşlem Yapıldı
                  </option>
                </select>

                <select
                  value={targetType}
                  onChange={(event) =>
                    updateParams({
                      icerik:
                        event.target
                          .value,

                      sayfa: "",
                    })
                  }
                >
                  <option value="">
                    Tüm içerikler
                  </option>

                  <option value="topic">
                    Konular
                  </option>

                  <option value="reply">
                    Yanıtlar
                  </option>
                </select>
              </div>

              <Link
                to="/hesabim/forum-bildirimlerim"
                className="forum-secondary-button"
              >
                <MessageCircle
                  size={16}
                />

                Forum Bildirimlerim
              </Link>
            </div>

            <div className="forum-reports-panel">
              {reportsQuery.isLoading ? (
                <div className="forum-reports-state">
                  <span className="auth-spinner" />

                  <p>
                    Bildirim geçmişi
                    yükleniyor...
                  </p>
                </div>
              ) : reportsQuery.isError ? (
                <div className="forum-reports-state">
                  <Flag size={30} />

                  <h2>
                    Bildirim geçmişi
                    alınamadı.
                  </h2>

                  <button
                    type="button"
                    className="forum-primary-button"
                    onClick={() =>
                      reportsQuery.refetch()
                    }
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : reports.length ===
                0 ? (
                <div className="forum-reports-state">
                  <Flag size={30} />

                  <h2>
                    Bildirim bulunamadı.
                  </h2>

                  <p>
                    Seçilen filtrelerle
                    eşleşen bir içerik
                    bildiriminiz yok.
                  </p>
                </div>
              ) : (
                <div className="forum-reports-list">
                  {reports.map(
                    (report) => (
                      <article
                        className="forum-report-history-card"
                        key={
                          report.id
                        }
                      >
                        <header className="forum-report-history-card__header">
                          <div>
                            <span
                              className={`forum-report-history-status forum-report-history-status--${report.status}`}
                            >
                              {statusLabels[
                                report
                                  .status
                              ] ||
                                report.status}
                            </span>

                            <span>
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

                        <div className="forum-report-history-card__body">
                          <div className="forum-report-history-card__topic">
                            <span>
                              İlgili konu
                            </span>

                            <h2>
                              {report.topic
                                ?.title ||
                                "Konu artık mevcut değil"}
                            </h2>

                            {report.topic
                              ?.category
                              ?.name && (
                              <small>
                                {
                                  report
                                    .topic
                                    .category
                                    .name
                                }
                              </small>
                            )}
                          </div>

                          {report.targetType ===
                            "reply" &&
                            report.reply
                              ?.body && (
                              <blockquote>
                                {truncateText(
                                  report
                                    .reply
                                    .body
                                )}
                              </blockquote>
                            )}

                          <div className="forum-report-history-card__reason">
                            <span>
                              Bildirim nedeni
                            </span>

                            <strong>
                              {reasonLabels[
                                report
                                  .reason
                              ] ||
                                report.reason}
                            </strong>

                            <p>
                              {report.description ||
                                "Ek açıklama yazılmadı."}
                            </p>
                          </div>
                        </div>

                        <footer className="forum-report-history-card__footer">
                          <div>
                            {report.reviewedAt && (
                              <span>
                                Sonuçlandırılma
                                tarihi:{" "}
                                {formatDate(
                                  report.reviewedAt
                                )}
                              </span>
                            )}
                          </div>

                          {report.publicLink && (
                            <Link
                              to={
                                report.publicLink
                              }
                              className="forum-secondary-button"
                            >
                              <ExternalLink
                                size={16}
                              />

                              İçeriği Aç
                            </Link>
                          )}
                        </footer>
                      </article>
                    )
                  )}
                </div>
              )}

              {pagination &&
                pagination.totalPages >
                  1 && (
                  <div className="forum-reports-pagination">
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
                          updateParams({
                            sayfa:
                              Math.max(
                                pagination.page -
                                  1,
                                1
                              ),
                          })
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
                          updateParams({
                            sayfa:
                              pagination.page +
                              1,
                          })
                        }
                      >
                        <ChevronRight
                          size={18}
                        />
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </Container>
        </section>
      </div>
    );
  };

export default MyForumReportsPage;
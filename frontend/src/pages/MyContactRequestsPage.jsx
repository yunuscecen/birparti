import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  MessageSquareText,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  getMyContactRequests,
} from "../services/contactRequestService";

const statusLabels = {
  new: "Yeni",
  inReview: "İnceleniyor",
  answered: "Yanıtlandı",
  closed: "Kapatıldı",
  spam: "İnceleme dışı",
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

const MyContactRequestsPage = () => {
  const [
    page,
    setPage,
  ] = useState(1);

  const [
    status,
    setStatus,
  ] = useState("");

  useEffect(() => {
    document.title =
      "Taleplerim | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const requestsQuery =
    useQuery({
      queryKey: [
        "my-contact-requests",
        page,
        status,
      ],

      queryFn: () =>
        getMyContactRequests({
          page,
          status,
        }),

      placeholderData: (
        previousData
      ) => previousData,

      retry: false,
    });

  const requests =
    requestsQuery.data
      ?.requests || [];

  const pagination =
    requestsQuery.data
      ?.pagination || {
        page: 1,
        totalPages: 1,
        totalRequests: 0,
      };

  return (
    <div className="account-contact-page">
      <section className="account-contact-hero">
        <Container>
          <Link
            to="/hesabim"
            className="account-contact-back"
          >
            <ArrowLeft size={17} />
            Hesabıma Dön
          </Link>

          <div className="account-contact-hero__content">
            <div>
              <p className="account-contact-hero__eyebrow">
                Üye alanı
              </p>

              <h1>Taleplerim</h1>

              <p>
                Gönderdiğiniz taleplerin
                durumunu ve yönetimin
                sizinle paylaştığı
                yanıtları takip edin.
              </p>
            </div>

            <Link
              to="/iletisim"
              className="account-contact-create"
            >
              <MessageSquarePlus
                size={18}
              />

              Yeni Talep Oluştur
            </Link>
          </div>
        </Container>
      </section>

      <section className="account-contact-content">
        <Container>
          <div className="account-contact-toolbar">
            <div>
              <strong>
                Talepler
              </strong>

              <span>
                {pagination.totalRequests}
                {" "}
                kayıt
              </span>
            </div>

            <label>
              <span>Duruma göre filtrele</span>

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
              </select>
            </label>
          </div>

          {requestsQuery.isLoading && (
            <div className="account-contact-state">
              <span className="auth-spinner" />

              <p>
                Talepleriniz
                yükleniyor...
              </p>
            </div>
          )}

          {requestsQuery.isError && (
            <div className="account-contact-state account-contact-state--error">
              <MessageSquareText
                size={28}
              />

              <h2>
                Talepleriniz
                yüklenemedi.
              </h2>

              <p>
                {requestsQuery.error
                  ?.message ||
                  "İstek sırasında bir hata oluştu."}
              </p>

              <button
                type="button"
                onClick={() =>
                  requestsQuery.refetch()
                }
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {!requestsQuery.isLoading &&
            !requestsQuery.isError &&
            requests.length === 0 && (
              <div className="account-contact-state">
                <MessageSquareText
                  size={30}
                />

                <h2>
                  Henüz bir talebiniz
                  bulunmuyor.
                </h2>

                <p>
                  Öneri, görüş, şikâyet
                  veya teknik
                  sorunlarınızı iletişim
                  formundan bize
                  iletebilirsiniz.
                </p>

                <Link to="/iletisim">
                  İlk Talebimi Oluştur
                </Link>
              </div>
            )}

          {!requestsQuery.isLoading &&
            !requestsQuery.isError &&
            requests.length > 0 && (
              <div className="account-contact-list">
                {requests.map(
                  (request) => (
                    <article
                      className="account-contact-card"
                      key={request._id}
                    >
                      <div className="account-contact-card__heading">
                        <div>
                          <span className="account-contact-card__type">
                            {typeLabels[
                              request.type
                            ] ||
                              request.type}
                          </span>

                          <h2>
                            {request.subject}
                          </h2>

                          <time>
                            Gönderildi:{" "}
                            {formatDate(
                              request.createdAt
                            )}
                          </time>
                        </div>

                        <span
                          className={`account-contact-status account-contact-status--${request.status}`}
                        >
                          {statusLabels[
                            request.status
                          ] ||
                            request.status}
                        </span>
                      </div>

                      <div className="account-contact-card__message">
                        <strong>
                          Talebiniz
                        </strong>

                        <p>
                          {request.message}
                        </p>
                      </div>

                      <div
                        className={`account-contact-response ${
                          request.publicResponse
                            ? "account-contact-response--answered"
                            : ""
                        }`}
                      >
                        <strong>
                          Yönetimin Yanıtı
                        </strong>

                        {request.publicResponse ? (
                          <>
                            <p>
                              {
                                request.publicResponse
                              }
                            </p>

                            <time>
                              Yanıt tarihi:{" "}
                              {formatDate(
                                request.responseUpdatedAt ||
                                  request.answeredAt
                              )}
                            </time>
                          </>
                        ) : (
                          <p>
                            Talebiniz için
                            henüz sizinle
                            paylaşılmış bir
                            yanıt bulunmuyor.
                          </p>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            )}

          {pagination.totalPages > 1 && (
            <div className="account-contact-pagination">
              <button
                type="button"
                disabled={
                  page <= 1 ||
                  requestsQuery.isFetching
                }
                onClick={() =>
                  setPage(
                    (currentPage) =>
                      Math.max(
                        currentPage - 1,
                        1
                      )
                  )
                }
              >
                <ChevronLeft
                  size={17}
                />

                Önceki
              </button>

              <span>
                {pagination.page}
                {" / "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >=
                    pagination.totalPages ||
                  requestsQuery.isFetching
                }
                onClick={() =>
                  setPage(
                    (currentPage) =>
                      Math.min(
                        currentPage + 1,
                        pagination.totalPages
                      )
                  )
                }
              >
                Sonraki

                <ChevronRight
                  size={17}
                />
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default MyContactRequestsPage;
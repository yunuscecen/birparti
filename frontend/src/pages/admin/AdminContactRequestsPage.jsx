import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Search,
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

import {
  getAdminContactRequests,
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

const priorityLabels = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
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

const AdminContactRequestsPage =
  () => {
    const [
      page,
      setPage,
    ] = useState(1);

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
    ] = useState("");

    const [
      type,
      setType,
    ] = useState("");

    const [
      priority,
      setPriority,
    ] = useState("");

    const [
      archived,
      setArchived,
    ] = useState("false");

    useEffect(() => {
      document.title =
        "Talepler | Bir Parti Yönetim";

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

    const requestsQuery =
      useQuery({
        queryKey: [
          "admin-contact-requests",
          page,
          search,
          status,
          type,
          priority,
          archived,
        ],

        queryFn: () =>
          getAdminContactRequests({
            page,
            search,
            status,
            type,
            priority,
            archived,
          }),
      });

    const requests =
      requestsQuery.data
        ?.requests || [];

    const pagination =
      requestsQuery.data
        ?.pagination;

    return (
      <div className="admin-page">
        <div className="admin-page__heading">
          <div>
            <p>
              İletişim yönetimi
            </p>

            <h1>
              Talepler
            </h1>
          </div>

          <span>
            İletişim formundan
            gönderilen öneri, görüş
            ve şikâyetleri inceleyin.
          </span>
        </div>

        <section className="admin-panel-card">
          <div className="admin-user-filters admin-contact-filters">
            <div className="admin-search">
              <Search size={19} />

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Ad, e-posta veya konuda ara..."
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

            <select
              value={type}
              onChange={(event) => {
                setType(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm türler
              </option>

              {Object.entries(
                typeLabels
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

            <select
              value={priority}
              onChange={(event) => {
                setPriority(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm öncelikler
              </option>

              {Object.entries(
                priorityLabels
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

            <select
              value={archived}
              onChange={(event) => {
                setArchived(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="false">
                Aktif talepler
              </option>

              <option value="true">
                Arşivlenenler
              </option>

              <option value="all">
                Tümü
              </option>
            </select>
          </div>

          {requestsQuery.isLoading ? (
            <div className="admin-state">
              <span className="auth-spinner" />

              <p>
                Talepler
                yükleniyor...
              </p>
            </div>
          ) : requestsQuery.isError ? (
            <div className="admin-state">
              <h2>
                Talepler alınamadı.
              </h2>

              <p>
                {
                  requestsQuery
                    .error?.message
                }
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
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gönderen</th>
                    <th>Talep</th>
                    <th>Tür</th>
                    <th>Durum</th>
                    <th>Öncelik</th>
                    <th>Tarih</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map(
                    (request) => (
                      <tr
                        key={
                          request._id
                        }
                      >
                        <td>
                          <div className="admin-contact-sender">
                            <strong>
                              {
                                request.fullName
                              }
                            </strong>

                            <span>
                              {
                                request.email
                              }
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-contact-subject">
                            <strong>
                              {
                                request.subject
                              }
                            </strong>

                            <span>
                              {request.message
                                ?.length >
                              80
                                ? `${request.message.slice(
                                    0,
                                    80
                                  )}…`
                                : request.message}
                            </span>
                          </div>
                        </td>

                        <td>
                          {
                            typeLabels[
                              request.type
                            ] ||
                            request.type
                          }
                        </td>

                        <td>
                          <span
                            className={`admin-contact-status admin-contact-status--${request.status}`}
                          >
                            {
                              statusLabels[
                                request.status
                              ] ||
                              request.status
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-contact-priority admin-contact-priority--${request.priority}`}
                          >
                            {
                              priorityLabels[
                                request.priority
                              ] ||
                              request.priority
                            }
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            request.createdAt
                          )}
                        </td>

                        <td>
                          <Link
                            to={`/admin/talepler/${request._id}`}
                            className="admin-secondary-button"
                          >
                            <Eye
                              size={16}
                            />

                            İncele
                          </Link>
                        </td>
                      </tr>
                    )
                  )}

                  {requests.length ===
                    0 && (
                    <tr>
                      <td colSpan="7">
                        <div className="admin-contact-empty">
                          {archived ===
                          "true" ? (
                            <Archive
                              size={25}
                            />
                          ) : (
                            <Inbox
                              size={25}
                            />
                          )}

                          <strong>
                            Talep bulunamadı.
                          </strong>

                          <span>
                            Seçilen
                            filtrelerle
                            eşleşen bir
                            talep yok.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {pagination &&
            pagination.totalPages >
              1 && (
              <div className="admin-pagination">
                <span>
                  Toplam{" "}
                  {
                    pagination.totalRequests
                  }{" "}
                  talep
                </span>

                <div>
                  <button
                    type="button"
                    disabled={
                      pagination.page <=
                      1
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
                    {
                      pagination.page
                    }{" "}
                    /{" "}
                    {
                      pagination.totalPages
                    }
                  </strong>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current +
                          1
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

export default AdminContactRequestsPage;
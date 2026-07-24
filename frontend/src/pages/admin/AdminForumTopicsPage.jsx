import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Pin,
  PinOff,
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
  getAdminForumCategories,
  getAdminForumTopics,
  updateAdminForumTopicModeration,
} from "../../services/adminForumService";

const statusLabels = {
  open: "Açık",
  locked: "Kilitli",
  archived: "Arşivlendi",
  hidden: "Gizli",
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const AdminForumTopicsPage = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("");

  const [status, setStatus] = useState("");
  const [pinned, setPinned] = useState("");

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    document.title =
      "Forum Konuları | Bir Parti Yönetim";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const categoriesQuery = useQuery({
    queryKey: ["admin-forum-categories"],
    queryFn: getAdminForumCategories,
  });

  const topicsQuery = useQuery({
    queryKey: [
      "admin-forum-topics",
      page,
      search,
      category,
      status,
      pinned,
    ],

    queryFn: () =>
      getAdminForumTopics({
        page,
        search,
        category,
        status,
        pinned,
      }),
  });

  const moderationMutation = useMutation({
    mutationFn:
      updateAdminForumTopicModeration,

    onSuccess: async () => {
      setFeedback({
        type: "success",
        message:
          "Forum konusu moderasyon ayarları güncellendi.",
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-forum-topics"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["forum-topics"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["forum-topic"],
        }),
      ]);
    },

    onError: (error) => {
      setFeedback({
        type: "error",

        message: getErrorMessage(
          error,
          "Forum konusu güncellenemedi."
        ),
      });
    },
  });

  const updateTopic = ({
    topic,
    nextStatus = topic.status,
    nextPinned = topic.isPinned,
  }) => {
    moderationMutation.mutate({
      topicId: topic._id,

      formData: {
        status: nextStatus,
        isPinned: Boolean(nextPinned),
      },
    });
  };

  const categories =
    categoriesQuery.data?.categories || [];

  const topics =
    topicsQuery.data?.topics || [];

  const pagination =
    topicsQuery.data?.pagination;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Forum moderasyonu</p>
          <h1>Forum Konuları</h1>
        </div>

        <span>
          Konuları sabitleyin, kilitleyin,
          arşivleyin veya gizleyin.
        </span>
      </div>

      {feedback.message && (
        <div
          className={`admin-feedback ${
            feedback.type === "error"
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

      <section className="admin-panel-card">
        <div className="admin-user-filters admin-forum-filters">
          <div className="admin-search">
            <Search size={19} />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Başlık, içerik veya yazarda ara..."
            />
          </div>

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              Tüm kategoriler
            </option>

            {categories.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              Tüm durumlar
            </option>

            <option value="open">Açık</option>
            <option value="locked">
              Kilitli
            </option>
            <option value="archived">
              Arşivlendi
            </option>
            <option value="hidden">
              Gizli
            </option>
          </select>

          <select
            value={pinned}
            onChange={(event) => {
              setPinned(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              Tüm sabitlemeler
            </option>

            <option value="true">
              Yalnızca sabitler
            </option>

            <option value="false">
              Sabit olmayanlar
            </option>
          </select>
        </div>

        {topicsQuery.isLoading ? (
          <div className="admin-state">
            <span className="auth-spinner" />
            <p>Forum konuları yükleniyor...</p>
          </div>
        ) : topicsQuery.isError ? (
          <div className="admin-state">
            <h2>Forum konuları alınamadı.</h2>

            <button
              type="button"
              onClick={() =>
                topicsQuery.refetch()
              }
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table admin-forum-table">
              <thead>
                <tr>
                  <th>Konu</th>
                  <th>Yazar</th>
                  <th>Kategori</th>
                  <th>İstatistik</th>
                  <th>Durum</th>
                  <th>Sabitleme</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {topics.map((topic) => (
                  <tr key={topic._id}>
                    <td>
                      <strong>{topic.title}</strong>

                      <span>
                        Son hareket:{" "}
                        {formatDate(
                          topic.lastActivityAt
                        )}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {topic.authorInfo?.name ||
                          "Bir Parti"}
                      </strong>

                      <span>
                        {topic.authorInfo?.role ||
                          "Sistem"}
                      </span>
                    </td>

                    <td>
                      {topic.category?.name || "—"}
                    </td>

                    <td>
                      <div className="admin-forum-stats">
                        <span>
                          {topic.replyCount || 0} yanıt
                        </span>

                        <span>
                          {topic.viewCount || 0} görüntülenme
                        </span>
                      </div>
                    </td>

                    <td>
                      <select
                        className="admin-table-select"
                        value={topic.status}
                        onChange={(event) =>
                          updateTopic({
                            topic,

                            nextStatus:
                              event.target.value,
                          })
                        }
                        disabled={
                          moderationMutation.isPending
                        }
                      >
                        <option value="open">
                          Açık
                        </option>

                        <option value="locked">
                          Kilitli
                        </option>

                        <option value="archived">
                          Arşivlendi
                        </option>

                        <option value="hidden">
                          Gizli
                        </option>
                      </select>

                      <span
                        className={`admin-status admin-status--${topic.status}`}
                      >
                        {statusLabels[topic.status]}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`admin-pin-button ${
                          topic.isPinned
                            ? "admin-pin-button--active"
                            : ""
                        }`}
                        onClick={() =>
                          updateTopic({
                            topic,

                            nextPinned:
                              !topic.isPinned,
                          })
                        }
                        disabled={
                          moderationMutation.isPending
                        }
                      >
                        {topic.isPinned ? (
                          <>
                            <PinOff size={16} />
                            Sabitlemeyi Kaldır
                          </>
                        ) : (
                          <>
                            <Pin size={16} />
                            Sabitle
                          </>
                        )}
                      </button>
                    </td>

                    <td>
                      <div className="admin-inline-actions">
                        <Link
  to={`/admin/forum/${topic._id}/moderasyon`}
>
  <ShieldCheck size={16} />
  Yanıtları Yönet
</Link>
                        <Link
                          to={`/forum/${topic.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Eye size={16} />
                          Görüntüle
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            updateTopic({
                              topic,

                              nextStatus:
                                topic.status ===
                                "locked"
                                  ? "open"
                                  : "locked",
                            })
                          }
                        >
                          <Lock size={16} />

                          {topic.status === "locked"
                            ? "Kilidi Aç"
                            : "Kilitle"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {topics.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      Forum konusu bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="admin-pagination">
            <span>
              Toplam {pagination.totalTopics} konu
            </span>

            <div>
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>

              <strong>
                {pagination.page} /{" "}
                {pagination.totalPages}
              </strong>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage(
                    (current) => current + 1
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminForumTopicsPage;
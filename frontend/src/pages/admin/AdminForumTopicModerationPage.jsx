import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  MessageCircle,
  Pin,
  RotateCcw,
  Trash2,
  XCircle,
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
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getAdminForumTopicById,
  getAdminForumTopicReplies,
  updateAdminForumReplyModeration,
  updateAdminForumTopicModeration,
} from "../../services/adminForumService";
const topicStatusLabels = {
  open: "Açık",
  locked: "Kilitli",
  archived: "Arşivlendi",
  hidden: "Gizli",
};

const approvalStatusLabels = {
  pending: "Onay Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

const replyStatusLabels = {
  published: "Yayında",
  hidden: "Gizli",
  deleted: "Silinmiş",
};

const getErrorMessage = (
  error,
  fallback
) => {
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

const ReplyModerationCard = ({
  reply,
  isChild = false,
  isUpdating = false,
  onModerate,
}) => {
  return (
    <article
      className={`admin-forum-reply ${
        isChild
          ? "admin-forum-reply--child"
          : ""
      }`}
    >
      <header className="admin-forum-reply__header">
        <div>
          <strong>
            {reply.authorInfo?.name ||
              reply.authorName ||
              "Forum Üyesi"}
          </strong>

          <span>
            {reply.authorInfo?.email ||
              reply.authorInfo?.role ||
              "Üye"}
          </span>
        </div>

        <div className="admin-forum-reply__meta">
          <span>
            {isChild
              ? "Alt cevap"
              : "Ana yanıt"}
          </span>

          <span>
            {formatDate(
              reply.createdAt
            )}
          </span>

          <span
            className={`admin-status admin-status--reply-${reply.status}`}
          >
            {replyStatusLabels[
              reply.status
            ] || reply.status}
          </span>
        </div>
      </header>

      {reply.replyToUserInfo?.name && (
        <div className="admin-forum-reply__target">
          <span>
            <strong>
              {
                reply.replyToUserInfo
                  .name
              }
            </strong>{" "}
            kullanıcısına yanıt
          </span>
        </div>
      )}

      <div className="admin-forum-reply__body">
        {reply.body
          ?.split("\n")
          .filter(Boolean)
          .map(
            (
              paragraph,
              index
            ) => (
              <p key={index}>
                {paragraph}
              </p>
            )
          )}
      </div>

      <footer className="admin-forum-reply__actions">
        <button
          type="button"
          onClick={() =>
            onModerate(
              reply._id,
              "published"
            )
          }
          disabled={
            isUpdating ||
            reply.status ===
              "published"
          }
        >
          <RotateCcw size={16} />
          Yayınla
        </button>

        <button
          type="button"
          onClick={() =>
            onModerate(
              reply._id,
              "hidden"
            )
          }
          disabled={
            isUpdating ||
            reply.status ===
              "hidden"
          }
        >
          <EyeOff size={16} />
          Gizle
        </button>

        <button
          type="button"
          className="admin-danger-button"
          onClick={() =>
            onModerate(
              reply._id,
              "deleted"
            )
          }
          disabled={
            isUpdating ||
            reply.status ===
              "deleted"
          }
        >
          <Trash2 size={16} />
          Silinmiş İşaretle
        </button>
      </footer>
    </article>
  );
};

const AdminForumTopicModerationPage =
  () => {
    const { topicId } =
      useParams();

    const navigate =
      useNavigate();

    const queryClient =
      useQueryClient();

    const [page, setPage] =
      useState(1);

    const [
      feedback,
      setFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    useEffect(() => {
      document.title =
        "Forum Konu Moderasyonu | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const topicQuery =
      useQuery({
        queryKey: [
          "admin-forum-topic",
          topicId,
        ],

        queryFn: () =>
          getAdminForumTopicById(
            topicId
          ),

        enabled:
          Boolean(topicId),

        retry: false,
      });

    const repliesQuery =
      useQuery({
        queryKey: [
          "admin-forum-topic-replies",
          topicId,
          page,
        ],

        queryFn: () =>
          getAdminForumTopicReplies({
            topicId,
            page,
          }),

        enabled:
          Boolean(topicId),

        retry: false,
      });

    const refreshForumData =
      async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "admin-forum-topic",
              topicId,
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "admin-forum-topic-replies",
              topicId,
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "admin-forum-topics",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "forum-topics",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "forum-topic",
            ],
          }),
        ]);
      };

    const topicMutation =
      useMutation({
        mutationFn:
          updateAdminForumTopicModeration,

        onSuccess: async () => {
          setFeedback({
            type: "success",
            message:
              "Konu ayarları güncellendi.",
          });

          await refreshForumData();
        },

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Konu güncellenemedi."
              ),
          });
        },
      });

    const replyMutation =
      useMutation({
        mutationFn:
          updateAdminForumReplyModeration,

        onSuccess: async () => {
          setFeedback({
            type: "success",
            message:
              "Yanıt moderasyon durumu güncellendi.",
          });

          await refreshForumData();
        },

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Yanıt güncellenemedi."
              ),
          });
        },
      });

    const topic =
      topicQuery.data?.topic;

    const replies =
      repliesQuery.data
        ?.replies || [];

    const pagination =
      repliesQuery.data
        ?.pagination;

    const statusCounts =
      repliesQuery.data
        ?.statusCounts || {
        published: 0,
        hidden: 0,
        deleted: 0,
      };

const updateTopic = ({
  status =
    topic?.status,
  isPinned =
    topic?.isPinned,
  approvalStatus,
  rejectionReason = "",
}) => {
  if (!topic) {
    return;
  }

  topicMutation.mutate({
    topicId:
      topic._id,

    formData: {
      status,
      isPinned:
        Boolean(isPinned),

      ...(approvalStatus && {
        approvalStatus,
        rejectionReason,
      }),
    },
  });
};

const approveTopic = () => {
  updateTopic({
    approvalStatus:
      "approved",

    rejectionReason: "",
  });
};

const rejectTopic = () => {
  const reason =
    window.prompt(
      "Konunun reddedilme nedenini yazın:",
      topic?.rejectionReason ||
        ""
    );

  if (reason === null) {
    return;
  }

  if (
    reason.trim().length < 3
  ) {
    setFeedback({
      type: "error",
      message:
        "Ret nedeni en az 3 karakter olmalıdır.",
    });

    return;
  }

  updateTopic({
    approvalStatus:
      "rejected",

    rejectionReason:
      reason.trim(),
  });
};

    const moderateReply = (
      replyId,
      status
    ) => {
      if (
        status === "deleted"
      ) {
        const confirmed =
          window.confirm(
            "Bu yanıtı silinmiş olarak işaretlemek istediğinize emin misiniz?"
          );

        if (!confirmed) {
          return;
        }
      }

      replyMutation.mutate({
        replyId,
        status,
      });
    };

    const isLoading =
      topicQuery.isLoading ||
      repliesQuery.isLoading;

    if (isLoading) {
      return (
        <div className="admin-state">
          <span className="auth-spinner" />

          <p>
            Forum konusu ve
            yanıtları yükleniyor...
          </p>
        </div>
      );
    }

    if (
      topicQuery.isError ||
      !topic
    ) {
      return (
        <div className="admin-state">
          <h1>
            Forum konusu
            bulunamadı.
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/forum"
              )
            }
          >
            Forum Konularına Dön
          </button>
        </div>
      );
    }

    return (
      <div className="admin-page">
        <div className="admin-page__heading">
          <div>
            <p>
              Forum moderasyonu
            </p>

            <h1>
              Konu ve Yanıtlar
            </h1>
          </div>

          <Link
            to="/admin/forum"
            className="admin-secondary-button"
          >
            <ArrowLeft size={17} />
            Konulara Dön
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

        <section className="admin-panel-card admin-forum-topic-summary">
          <div className="admin-forum-topic-summary__content">
            <div className="admin-forum-topic-summary__meta">
              <span>
                {topic.category?.name ||
                  "Kategorisiz"}
              </span>

              <span>
                {formatDate(
                  topic.createdAt
                )}
              </span>

              <span>
                <MessageCircle
                  size={15}
                />

                {topic.replyCount || 0}
                {" "}
                görünür yanıt
              </span>

              <span>
                <Eye size={15} />

                {topic.viewCount || 0}
                {" "}
                görüntülenme
              </span>
            </div>

            <h2>{topic.title}</h2>

            <p>
              {topic.body}
            </p>

            <div className="admin-forum-topic-summary__author">
              <strong>
                {topic.authorInfo
                  ?.name ||
                  "Bir Parti"}
              </strong>

              <span>
                {topic.authorInfo
                  ?.email ||
                  topic.authorInfo
                    ?.role ||
                  "Sistem"}
              </span>
            </div>
          </div>

         <div className="admin-forum-topic-controls">
  <div className="admin-form-field">
    <label>
      Yayın onayı
    </label>

    <span
      className={`admin-status admin-status--${
        topic.approvalStatus ||
        "approved"
      }`}
    >
      {
        approvalStatusLabels[
          topic.approvalStatus ||
            "approved"
        ]
      }
    </span>

    {topic.approvalStatus ===
      "rejected" &&
      topic.rejectionReason && (
        <small>
          Ret nedeni:{" "}
          {topic.rejectionReason}
        </small>
      )}

    <div className="admin-inline-actions">
      <button
        type="button"
        onClick={approveTopic}
        disabled={
          topicMutation.isPending ||
          (
            topic.approvalStatus ||
            "approved"
          ) === "approved"
        }
      >
        <CheckCircle2 size={16} />
        Konuyu Onayla
      </button>

      <button
        type="button"
        className="admin-danger-button"
        onClick={rejectTopic}
        disabled={
          topicMutation.isPending ||
          topic.approvalStatus ===
            "rejected"
        }
      >
        <XCircle size={16} />
        Konuyu Reddet
      </button>
    </div>
  </div>

  <div className="admin-form-field">
    <label>
      Konu durumu
    </label>

              <select
                value={topic.status}
                onChange={(event) =>
                  updateTopic({
                    status:
                      event.target
                        .value,
                  })
                }
                disabled={
                  topicMutation.isPending
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

              <small>
                {
                  topicStatusLabels[
                    topic.status
                  ]
                }
              </small>
            </div>

            <label className="admin-form-checkbox admin-form-checkbox--boxed">
              <input
                type="checkbox"
                checked={
                  Boolean(
                    topic.isPinned
                  )
                }
                onChange={(event) =>
                  updateTopic({
                    isPinned:
                      event.target
                        .checked,
                  })
                }
                disabled={
                  topicMutation.isPending
                }
              />

              <span>
                <strong>
                  Konuyu sabitle
                </strong>

                <small>
                  Forum listesinin
                  üstünde gösterilir.
                </small>
              </span>
            </label>

           {(
  topic.approvalStatus ||
  "approved"
) === "approved" &&
[
  "open",
  "locked",
].includes(
  topic.status
) && (
              <Link
                to={`/forum/${topic.slug}`}
                target="_blank"
                rel="noreferrer"
                className="admin-secondary-button"
              >
                <ExternalLink
                  size={16}
                />
                Public Görünümü Aç
              </Link>
            )}
          </div>
        </section>

        <section className="admin-forum-moderation-stats">
          <article>
            <span>Yayında</span>
            <strong>
              {
                statusCounts.published
              }
            </strong>
          </article>

          <article>
            <span>Gizli</span>
            <strong>
              {statusCounts.hidden}
            </strong>
          </article>

          <article>
            <span>
              Silinmiş
            </span>

            <strong>
              {statusCounts.deleted}
            </strong>
          </article>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>
                Yanıt moderasyonu
              </p>

              <h2>
                Ana Yanıtlar ve
                Alt Cevaplar
              </h2>
            </div>

            <span>
              Yanıtlar fiziksel olarak
              silinmez; durumları
              değiştirilir.
            </span>
          </div>

          {repliesQuery.isError ? (
            <div className="admin-state">
              <h2>
                Yanıtlar alınamadı.
              </h2>

              <button
                type="button"
                onClick={() =>
                  repliesQuery.refetch()
                }
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="admin-forum-reply-list">
              {replies.map(
                (reply) => (
                  <div
                    className="admin-forum-thread"
                    key={reply._id}
                  >
                    <ReplyModerationCard
                      reply={reply}
                      isUpdating={
                        replyMutation.isPending
                      }
                      onModerate={
                        moderateReply
                      }
                    />

                    {reply.childReplies
                      ?.length > 0 && (
                      <div className="admin-forum-child-replies">
                        {reply.childReplies.map(
                          (
                            childReply
                          ) => (
                            <ReplyModerationCard
                              key={
                                childReply._id
                              }
                              reply={
                                childReply
                              }
                              isChild
                              isUpdating={
                                replyMutation.isPending
                              }
                              onModerate={
                                moderateReply
                              }
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {replies.length ===
                0 && (
                <div className="admin-state">
                  <MessageCircle
                    size={26}
                  />

                  <h2>
                    Henüz yanıt
                    bulunmuyor.
                  </h2>
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
                    pagination.totalRootReplies
                  }{" "}
                  ana yanıt
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

export default AdminForumTopicModerationPage;
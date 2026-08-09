import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  EyeOff,
  FileText,
  Pencil,
  Lock,
  Trash2,
  MessageCircle,
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
  useSearchParams,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  deleteMyForumReply,
  deleteMyForumTopic,
  getMyForumOverview,
  getMyForumReplies,
  getMyForumTopics,
} from "../services/accountForumService";

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

const formatDate = (
  date
) => {
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

const MyForumActivityPage =
  () => {
    const queryClient =
  useQueryClient();

const [
  feedback,
  setFeedback,
] = useState({
  type: "",
  message: "",
});
    const [
      searchParams,
      setSearchParams,
    ] = useSearchParams();

    const tab =
      searchParams.get("sekme") ===
      "yanitlar"
        ? "replies"
        : "topics";

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

const topicApprovalStatus =
  tab === "topics" &&
  [
    "pending",
    "approved",
    "rejected",
  ].includes(status)
    ? status
    : "";

const topicStatus =
  tab === "topics" &&
  !topicApprovalStatus
    ? status
    : "";

    useEffect(() => {
      document.title =
        "Forum Hareketlerim | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const overviewQuery =
      useQuery({
        queryKey: [
          "my-forum-overview",
        ],

        queryFn:
          getMyForumOverview,
      });

    const topicsQuery =
      useQuery({
        queryKey: [
          "my-forum-topics",
          page,
          status,
        ],

        queryFn: () =>
         getMyForumTopics({
  page,
  status: topicStatus,
  approvalStatus:
    topicApprovalStatus,
}),

        enabled:
          tab === "topics",
      });

    const repliesQuery =
      useQuery({
        queryKey: [
          "my-forum-replies",
          page,
          status,
        ],

        queryFn: () =>
          getMyForumReplies({
            page,
            status,
          }),

        enabled:
          tab === "replies",
      });

const refreshForumActivity =
  async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "my-forum-overview",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "my-forum-topics",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "my-forum-replies",
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

const deleteTopicMutation =
  useMutation({
    mutationFn:
      deleteMyForumTopic,

    onSuccess: async (
      response
    ) => {
      setFeedback({
        type: "success",

        message:
          response?.message ||
          "Forum konusu silindi.",
      });

      await refreshForumActivity();
    },

    onError: (error) => {
      setFeedback({
        type: "error",

        message:
          error?.response?.data
            ?.message ||
          error?.message ||
          "Forum konusu silinemedi.",
      });
    },
  });

const deleteReplyMutation =
  useMutation({
    mutationFn:
      deleteMyForumReply,

    onSuccess: async (
      response
    ) => {
      setFeedback({
        type: "success",

        message:
          response?.message ||
          "Forum yanıtı silindi.",
      });

      await refreshForumActivity();
    },

    onError: (error) => {
      setFeedback({
        type: "error",

        message:
          error?.response?.data
            ?.message ||
          error?.message ||
          "Forum yanıtı silinemedi.",
      });
    },
  });

const handleDeleteTopic = (
  topic
) => {
  const hasReplies =
    Number(
      topic.replyCount || 0
    ) > 0;

  if (hasReplies) {
    setFeedback({
      type: "error",

      message:
        "Yanıt bulunan bir forum konusu kullanıcı tarafından silinemez.",
    });

    return;
  }

  const confirmed =
    window.confirm(
      `“${topic.title}” başlıklı konuyu silmek istediğinize emin misiniz?`
    );

  if (!confirmed) {
    return;
  }

  setFeedback({
    type: "",
    message: "",
  });

  deleteTopicMutation.mutate(
    topic._id
  );
};

const handleDeleteReply = (
  reply
) => {
  const confirmed =
    window.confirm(
      "Bu forum yanıtını silmek istediğinize emin misiniz?"
    );

  if (!confirmed) {
    return;
  }

  setFeedback({
    type: "",
    message: "",
  });

  deleteReplyMutation.mutate(
    reply._id
  );
};

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

    const changeTab = (
      nextTab
    ) => {
      updateParams({
        sekme:
          nextTab === "replies"
            ? "yanitlar"
            : "",
        sayfa: "",
        durum: "",
      });
    };

    const overview =
      overviewQuery.data
        ?.overview || {
       topicCount: 0,
openTopicCount: 0,
lockedTopicCount: 0,
hiddenTopicCount: 0,
pendingTopicCount: 0,
approvedTopicCount: 0,
rejectedTopicCount: 0,
        replyCount: 0,
        publishedReplyCount: 0,
        hiddenReplyCount: 0,
        deletedReplyCount: 0,
      };

    const topics =
      topicsQuery.data
        ?.topics || [];

    const replies =
      repliesQuery.data
        ?.replies || [];

    const pagination =
      tab === "topics"
        ? topicsQuery.data
            ?.pagination
        : repliesQuery.data
            ?.pagination;

    const activeQuery =
      tab === "topics"
        ? topicsQuery
        : repliesQuery;

    return (
      <div className="account-forum-page">
        <section className="account-forum-hero">
          <Container>
            <p className="account-forum-hero__eyebrow">
              Hesabım
            </p>

            <h1>
              Forum Hareketlerim
            </h1>

            <p>
              Açtığınız konuları,
              yazdığınız yanıtları ve
              moderasyon durumlarını
              buradan takip edebilirsiniz.
            </p>
          </Container>
        </section>

        <section className="account-forum-content">
          <Container>
            <div className="account-forum-overview">
              <article>
                <FileText
                  size={21}
                />

                <span>
                  Açtığım Konular
                </span>

                <strong>
                  {
                    overview.topicCount
                  }
                </strong>
              </article>

              <article>
                <MessageCircle
                  size={21}
                />

                <span>
                  Yazdığım Yanıtlar
                </span>

                <strong>
                  {
                    overview.replyCount
                  }
                </strong>
              </article>

              <article>
                <Lock size={21} />

                <span>
                  Kilitli Konular
                </span>

                <strong>
                  {
                    overview.lockedTopicCount
                  }
                </strong>
              </article>

              <article>
                <EyeOff size={21} />

                <span>
                  Gizli İçerikler
                </span>

                <strong>
                  {overview.hiddenTopicCount +
                    overview.hiddenReplyCount}
                </strong>
              </article>
            </div>
{feedback.message && (
  <div
    className={`account-forum-feedback ${
      feedback.type === "error"
        ? "account-forum-feedback--error"
        : ""
    }`}
  >
    <span>
      {feedback.message}
    </span>

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
            <div className="account-forum-panel">
              <div className="account-forum-tabs">
                <button
                  type="button"
                  className={
                    tab === "topics"
                      ? "account-forum-tab account-forum-tab--active"
                      : "account-forum-tab"
                  }
                  onClick={() =>
                    changeTab(
                      "topics"
                    )
                  }
                >
                  <FileText
                    size={17}
                  />
                  Konularım
                </button>

                <button
                  type="button"
                  className={
                    tab === "replies"
                      ? "account-forum-tab account-forum-tab--active"
                      : "account-forum-tab"
                  }
                  onClick={() =>
                    changeTab(
                      "replies"
                    )
                  }
                >
                  <MessageCircle
                    size={17}
                  />
                  Yanıtlarım
                </button>

                <select
                  value={status}
                  onChange={(
                    event
                  ) =>
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

                {tab ===
"topics" ? (
  <>
    <option value="pending">
      Onay Bekliyor
    </option>

    <option value="approved">
      Onaylandı
    </option>

    <option value="rejected">
      Reddedildi
    </option>

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
  </>
) : (
                    <>
                      <option value="published">
                        Yayında
                      </option>

                      <option value="hidden">
                        Gizli
                      </option>

                      <option value="deleted">
                        Silinmiş
                      </option>
                    </>
                  )}
                </select>
              </div>

              {activeQuery.isLoading ? (
                <div className="account-forum-state">
                  <span className="auth-spinner" />

                  <p>
                    Forum hareketleri
                    yükleniyor...
                  </p>
                </div>
              ) : activeQuery.isError ? (
                <div className="account-forum-state">
                  <h2>
                    Forum hareketleri
                    alınamadı.
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      activeQuery.refetch()
                    }
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : tab ===
                "topics" ? (
                <div className="account-forum-list">
                  {topics.map(
                    (topic) => (
                      <article
                        className="account-forum-item"
                        key={
                          topic._id
                        }
                      >
                        <div className="account-forum-item__content">
                          <div className="account-forum-item__meta">
                            <span>
                              {
                                topic
                                  .category
                                  ?.name
                              }
                            </span>

                            <span>
                              <Clock
                                size={
                                  14
                                }
                              />

                              {formatDate(
                                topic.createdAt
                              )}
                            </span>

                 <span
  className={`account-forum-status ${
    topic.deletedByAuthor
      ? "account-forum-status--deleted"
      : topic.approvalStatus ===
          "pending"
        ? "account-forum-status--pending"
        : topic.approvalStatus ===
            "rejected"
          ? "account-forum-status--rejected"
          : `account-forum-status--${topic.status}`
  }`}
>
  {topic.deletedByAuthor
    ? "Silindi"
    : topic.approvalStatus &&
        topic.approvalStatus !==
          "approved"
      ? approvalStatusLabels[
          topic.approvalStatus
        ]
      : topicStatusLabels[
          topic.status
        ]}
</span>
                          </div>

                          <h2>
                            {
                              topic.title
                            }
                          </h2>

                         <p>
  {topic.body
    .length >
  220
    ? `${topic.body.slice(
        0,
        220
      )}…`
    : topic.body}
</p>

{topic.approvalStatus ===
  "rejected" &&
  topic.rejectionReason && (
    <div className="account-forum-feedback account-forum-feedback--error">
      <strong>
        Ret nedeni:
      </strong>{" "}
      {topic.rejectionReason}
    </div>
  )}

<div className="account-forum-item__stats">
                            <span>
                              <MessageCircle
                                size={
                                  15
                                }
                              />

                              {topic.replyCount ||
                                0}{" "}
                              yanıt
                            </span>

                            <span>
                              {topic.viewCount ||
                                0}{" "}
                              görüntülenme
                            </span>
                          </div>
                        </div>

                        {[
  "open",
  "locked",
].includes(
  topic.status
) && (
<div className="account-forum-item__actions">
  <Link
    to={`/hesabim/forum-konusu/${topic._id}/duzenle`}
    className="account-forum-link"
  >
    <Pencil size={16} />
    Düzenle
  </Link>

 {(
  topic.approvalStatus ||
  "approved"
) === "approved" && (
  <Link
    to={`/forum/${topic.slug}`}
    className="account-forum-link"
  >
    <ExternalLink size={16} />
    Konuyu Aç
  </Link>
)}

  <button
    type="button"
    className="account-forum-delete-button"
    disabled={
      deleteTopicMutation.isPending ||
      Number(
        topic.replyCount || 0
      ) > 0
    }
    title={
      Number(
        topic.replyCount || 0
      ) > 0
        ? "Yanıt bulunan konu silinemez."
        : "Konuyu sil"
    }
    onClick={() =>
      handleDeleteTopic(
        topic
      )
    }
  >
    <Trash2 size={16} />
    Sil
  </button>
</div>
)}
                      </article>
                    )
                  )}

                  {topics.length ===
                    0 && (
                    <div className="account-forum-state">
                      <FileText
                        size={28}
                      />

                      <h2>
                        Konu bulunamadı.
                      </h2>

                      <p>
                        Seçilen durumla
                        eşleşen bir forum
                        konunuz bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="account-forum-list">
                  {replies.map(
                    (reply) => (
                      <article
                        className="account-forum-item"
                        key={
                          reply._id
                        }
                      >
                        <div className="account-forum-item__content">
                          <div className="account-forum-item__meta">
                            <span>
                              {reply.isChildReply
                                ? "Alt cevap"
                                : "Ana yanıt"}
                            </span>

                            <span>
                              <Clock
                                size={
                                  14
                                }
                              />

                              {formatDate(
                                reply.createdAt
                              )}
                            </span>

                           <span
  className={`account-forum-status ${
    reply.deletedByAuthor
      ? "account-forum-status--deleted"
      : `account-forum-status--reply-${reply.status}`
  }`}
>
  {reply.deletedByAuthor
    ? "Silindi"
    : replyStatusLabels[
        reply.status
      ]}
</span>
                          </div>

                          <h2>
                            {reply.topic
                              ?.title ||
                              "Konu bulunamadı"}
                          </h2>

                          {reply.replyTargetName && (
                            <span className="account-forum-reply-target">
                              {
                                reply.replyTargetName
                              }{" "}
                              kullanıcısına
                              yanıt
                            </span>
                          )}

                          <p>
                            {reply.body}
                          </p>

                          <span className="account-forum-item__category">
                            {reply.topic
                              ?.category
                              ?.name ||
                              "Kategorisiz"}
                          </span>
                        </div>

                       {reply.topic &&
  reply.status ===
    "published" &&
  [
    "open",
    "locked",
  ].includes(
    reply.topic.status
  ) && (
  <div className="account-forum-item__actions">
  <Link
    to={`/hesabim/forum-yaniti/${reply._id}/duzenle`}
    className="account-forum-link"
  >
    <Pencil size={16} />
    Düzenle
  </Link>

  <Link
    to={
      `/forum/${reply.topic.slug}` +
      `#yanit-${reply._id}`
    }
    className="account-forum-link"
  >
    <ExternalLink size={16} />
    Yanıta Git
  </Link>

  <button
    type="button"
    className="account-forum-delete-button"
    disabled={
      deleteReplyMutation.isPending
    }
    onClick={() =>
      handleDeleteReply(
        reply
      )
    }
  >
    <Trash2 size={16} />
    Sil
  </button>
</div>
  )}
                      </article>
                    )
                  )}

                  {replies.length ===
                    0 && (
                    <div className="account-forum-state">
                      <MessageCircle
                        size={28}
                      />

                      <h2>
                        Yanıt bulunamadı.
                      </h2>

                      <p>
                        Seçilen durumla
                        eşleşen bir forum
                        yanıtınız bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {pagination &&
                pagination.totalPages >
                  1 && (
                  <div className="account-forum-pagination">
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
                )}
            </div>
          </Container>
        </section>
      </div>
    );
  };

export default MyForumActivityPage;
import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  CornerUpLeft,
  Eye,
   Flag,
  FolderKanban,
  Handshake,
  Lock,
  Lightbulb,
  LogIn,
  Route,
  MessageCircle,
  Pin,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
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
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Container from "../components/common/Container";
import ExpertBadge from "../components/forum/ExpertBadge";
import ForumReportModal from "../components/forum/ForumReportModal";
import { useAuth } from "../context/AuthContext";

import {
  createForumReply,
  getForumTopicBySlug,
  getMyForumTopicInteraction,
  updateForumTopicSolvedStatus,
  updateForumTopicSupport,
  updateForumTopicVote,
} from "../services/forumService";

const ideaStageLabels = {
  submitted: "Fikir Alındı",
  reviewing: "Değerlendiriliyor",
  planned: "Planlandı",
  in_progress:
    "Üzerinde Çalışılıyor",
  completed:
    "Hayata Geçirildi",
  not_planned:
    "Şimdilik Planlanmıyor",
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

const ForumTopicDetailPage = () => {
  const { slug } = useParams();
const location =
  useLocation();

const navigate =
  useNavigate();

const queryClient =
  useQueryClient();

const {
  user,
  isAuthenticated,
} = useAuth();

  const [
    replyBody,
    setReplyBody,
  ] = useState("");

  /*
   * null ise ana konuya cevap yazılır.
   * Doluysa seçilen yanıta cevap yazılır.
   */
  const [
    replyTarget,
    setReplyTarget,
  ] = useState(null);

  const [
    replyError,
    setReplyError,
  ] = useState("");
  const [
  reportTarget,
  setReportTarget,
] = useState(null);

const [
  interactionError,
  setInteractionError,
] = useState("");

  const topicQuery = useQuery({
    queryKey: [
      "forum-topic",
      slug,
    ],

    queryFn: () =>
      getForumTopicBySlug({
        slug,
      }),

    enabled: Boolean(slug),
    retry: false,
  });
const interactionQuery =
  useQuery({
    queryKey: [
      "forum-topic-interaction",
      slug,
    ],

    queryFn: () =>
      getMyForumTopicInteraction(
        slug
      ),

    enabled:
      Boolean(slug) &&
      isAuthenticated,

    retry: false,
  });
  const topic =
    topicQuery.data?.topic;

  const replies =
    topicQuery.data?.replies ||
    [];

  const pagination =
    topicQuery.data?.pagination;
const interaction =
  interactionQuery.data
    ?.interaction || {
    vote: 0,
    isSupported: false,
  };
    const currentUserId = String(
  user?.id ||
  user?._id ||
  ""
);

const solvedManagerRoles = [
  "moderator",
  "admin",
  "superAdmin",
];

const canManageSolved =
  isAuthenticated &&
  (String(
    topic?.authorInfo?.id ||
      ""
  ) === currentUserId ||
    solvedManagerRoles.includes(
      user?.role
    ));

const canReportContent = (
  authorId
) => {
  if (
    !isAuthenticated ||
    !currentUserId
  ) {
    return false;
  }

  return (
    String(authorId || "") !==
    currentUserId
  );
};

const openReportModal = ({
  targetType,
  targetId,
  targetLabel,
}) => {
  setReportTarget({
    targetType,
    targetId,
    targetLabel,
  });
};

const closeReportModal = () => {
  setReportTarget(null);
};

const updateTopicMetricsCache = (
  topicMetrics
) => {
  if (!topicMetrics) {
    return;
  }

  queryClient.setQueryData(
    [
      "forum-topic",
      slug,
    ],

    (currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,

        topic: {
          ...currentData.topic,
          ...topicMetrics,
        },
      };
    }
  );

  queryClient.invalidateQueries({
    queryKey: [
      "forum-topics",
    ],
  });
};

const handleInteractionError = (
  error
) => {
  setInteractionError(
    getErrorMessage(
      error,
      "İşlem tamamlanamadı."
    )
  );
};

const voteMutation =
  useMutation({
    mutationFn:
      updateForumTopicVote,

    onSuccess: (data) => {
      setInteractionError("");

      queryClient.setQueryData(
        [
          "forum-topic-interaction",
          slug,
        ],
        data
      );

      updateTopicMetricsCache(
        data.topic
      );
    },

    onError:
      handleInteractionError,
  });

const supportMutation =
  useMutation({
    mutationFn:
      updateForumTopicSupport,

    onSuccess: (data) => {
      setInteractionError("");

      queryClient.setQueryData(
        [
          "forum-topic-interaction",
          slug,
        ],
        data
      );

      updateTopicMetricsCache(
        data.topic
      );
    },

    onError:
      handleInteractionError,
  });

const solvedMutation =
  useMutation({
    mutationFn:
      updateForumTopicSolvedStatus,

    onSuccess: (data) => {
      setInteractionError("");

      updateTopicMetricsCache(
        data.topic
      );
    },

    onError:
      handleInteractionError,
  });

const redirectToLogin = () => {
  navigate(
    "/giris",
    {
      state: {
        from:
          `/forum/${slug}`,
      },
    }
  );
};

const handleVote = (
  voteValue
) => {
  if (!isAuthenticated) {
    redirectToLogin();
    return;
  }

  const nextVote =
    interaction.vote ===
    voteValue
      ? 0
      : voteValue;

  voteMutation.mutate({
    slug,
    vote: nextVote,
  });
};

const handleSupport = () => {
  if (!isAuthenticated) {
    redirectToLogin();
    return;
  }

  supportMutation.mutate({
    slug,

    isSupported:
      !interaction.isSupported,
  });
};

const handleSolved = () => {
  solvedMutation.mutate({
    slug,
    isSolved:
      !topic.isSolved,
  });
};

const interactionPending =
  voteMutation.isPending ||
  supportMutation.isPending ||
  solvedMutation.isPending;

  useEffect(() => {
    if (!topic) {
      return;
    }

    document.title =
      `${topic.title} | Topluluk | Bir Parti`;

    return () => {
      document.title =
        "Bir Parti";
    };
  }, [topic]);

useEffect(() => {
  if (
    !location.hash ||
    replies.length === 0
  ) {
    return undefined;
  }

  const targetId =
    decodeURIComponent(
      location.hash.slice(1)
    );

  const timeout =
    window.setTimeout(() => {
      const targetElement =
        document.getElementById(
          targetId
        );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        targetElement.classList.add(
          "forum-message--highlighted"
        );

        window.setTimeout(() => {
          targetElement.classList.remove(
            "forum-message--highlighted"
          );
        }, 2200);
      }
    }, 150);

  return () => {
    window.clearTimeout(
      timeout
    );
  };
}, [
  location.hash,
  replies,
]);


  const replyMutation =
    useMutation({
      mutationFn:
        createForumReply,

      onSuccess: (data) => {
        queryClient.setQueryData(
          [
            "forum-topic",
            slug,
          ],

          (currentData) => {
            if (!currentData) {
              return currentData;
            }

            const isChildReply =
              Boolean(
                data.rootReplyId
              );

            let nextReplies;

            if (isChildReply) {
              nextReplies =
                (
                  currentData.replies ||
                  []
                ).map(
                  (rootReply) =>
                    String(
                      rootReply._id
                    ) ===
                    String(
                      data.rootReplyId
                    )
                      ? {
                          ...rootReply,

                          childReplies: [
                            ...(
                              rootReply.childReplies ||
                              []
                            ),

                            data.reply,
                          ],
                        }
                      : rootReply
                );
            } else {
              nextReplies = [
                ...(
                  currentData.replies ||
                  []
                ),

                {
                  ...data.reply,
                  childReplies: [],
                },
              ];
            }

            const currentPagination =
              currentData.pagination ||
              {};

            return {
              ...currentData,

              topic: {
                ...currentData.topic,

                replyCount:
                  data.topic
                    .replyCount,

                lastReplyAt:
                  data.topic
                    .lastReplyAt,

                lastActivityAt:
                  data.topic
                    .lastActivityAt,
              },

              replies:
                nextReplies,

              pagination: {
                ...currentPagination,

                totalReplies:
                  (
                    currentPagination.totalReplies ||
                    0
                  ) + 1,

                totalRootReplies:
                  (
                    currentPagination.totalRootReplies ||
                    0
                  ) +
                  (isChildReply
                    ? 0
                    : 1),
              },
            };
          }
        );

        queryClient.invalidateQueries({
          queryKey: [
            "forum-topics",
          ],
        });
        queryClient.invalidateQueries({
  queryKey: [
    "my-forum-overview",
  ],
});

queryClient.invalidateQueries({
  queryKey: [
    "my-forum-replies",
  ],
});

        setReplyBody("");
        setReplyTarget(null);
        setReplyError("");
      },

      onError: (error) => {
        setReplyError(
          getErrorMessage(
            error,
            "Yanıt gönderilemedi."
          )
        );
      },
    });

  const startReply = (reply) => {
    setReplyTarget({
      id: reply._id,

      name:
        reply.authorInfo?.name ||
        reply.authorName ||
        "Forum Üyesi",
    });

    setReplyBody("");
    setReplyError("");
  };

  const cancelReplyTarget = () => {
    setReplyTarget(null);
    setReplyBody("");
    setReplyError("");
  };

  const handleReplySubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      replyBody.trim().length < 2
    ) {
      setReplyError(
        "Yanıt en az 2 karakter olmalıdır."
      );

      return;
    }

    setReplyError("");

    try {
  await replyMutation.mutateAsync({
    slug,

    body:
      replyBody.trim(),

    replyToReplyId:
      replyTarget?.id ||
      null,
  });
} catch {
  /*
   * Hata mesajı replyMutation
   * içindeki onError tarafından
   * ekranda gösteriliyor.
   */
}
  };

  const replyForm = (
    <form
      className="forum-reply-form forum-inline-reply-form"
      onSubmit={
        handleReplySubmit
      }
      noValidate
    >
      <div className="forum-reply-form__heading">
        <div>
          <p>
            {replyTarget
              ? "Yanıta cevap"
              : "Tartışmaya katılın"}
          </p>

          <h2>
            {replyTarget
              ? `${replyTarget.name} kişisine yanıt`
              : "Yanıt Yaz"}
          </h2>
        </div>

        {replyTarget && (
          <button
            type="button"
            className="forum-reply-target__close"
            onClick={
              cancelReplyTarget
            }
            aria-label="Yanıta cevap vermeyi iptal et"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {replyTarget && (
        <div className="forum-reply-target">
          <AtSign size={16} />

          <span>
            <strong>
              {replyTarget.name}
            </strong>{" "}
            kullanıcısına cevap
            yazıyorsunuz.
          </span>
        </div>
      )}

      {replyError && (
        <div className="forum-form-error">
          {replyError}
        </div>
      )}

      <div className="forum-form-field">
        <label htmlFor="forum-reply">
          Yanıtınız
        </label>

        <textarea
          id="forum-reply"
          value={replyBody}
          onChange={(event) =>
            setReplyBody(
              event.target.value
            )
          }
          rows={6}
          maxLength={15000}
          placeholder={
            replyTarget
              ? `${replyTarget.name} kullanıcısına cevabınızı yazın...`
              : "Görüşünüzü saygılı ve yapıcı bir şekilde paylaşın..."
          }
        />

        <small>
          {replyBody.length}/15000
          karakter
        </small>
      </div>

      <div className="forum-reply-form__actions">
        <button
          type="submit"
          className="forum-primary-button"
          disabled={
            replyMutation.isPending
          }
        >
          <Send size={17} />

          {replyMutation.isPending
            ? "Gönderiliyor..."
            : replyTarget
              ? "Cevabı Gönder"
              : "Yanıtı Gönder"}
        </button>
      </div>
    </form>
  );

  const renderReplyAction = (
    reply
  ) => {
    if (
      topic.status !== "open"
    ) {
      return null;
    }

    if (!isAuthenticated) {
      return (
        <Link
          to="/giris"
          state={{
            from:
              `/forum/${slug}`,
          }}
          className="forum-message__reply-button"
        >
          <CornerUpLeft
            size={15}
          />
          Yanıtla
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="forum-message__reply-button"
        onClick={() =>
          startReply(reply)
        }
      >
        <CornerUpLeft
          size={15}
        />
        Yanıtla
      </button>
    );
  };

  if (topicQuery.isLoading) {
    return (
      <div className="forum-state forum-state--page">
        <span className="auth-spinner" />
        <p>
         Topluluk konusu yükleniyor...
        </p>
      </div>
    );
  }

  if (
    topicQuery.isError ||
    !topic
  ) {
    return (
      <div className="forum-state forum-state--page">
        <h1>
         Topluluk konusu bulunamadı.
        </h1>

        <Link to="/forum">
          Topluluğa Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="forum-detail-page">
      <section className="forum-detail-hero">
        <Container>
          <Link
            to="/forum"
            className="forum-detail__back"
          >
            <ArrowLeft size={17} />
            Topluluğa Dön
          </Link>

             <div className="forum-topic-card__badges">
            {topic.isPinned && (
              <span>
                <Pin size={13} />
                Sabit
              </span>
            )}

            {topic.status ===
              "locked" && (
              <span>
                <Lock size={13} />
                Kilitli
              </span>
            )}

            {topic.ideaStage &&
              topic.ideaStage !==
                "none" && (
                <span className="forum-topic-badge--idea">
                  <Lightbulb
                    size={13}
                  />

                  {ideaStageLabels[
                    topic.ideaStage
                  ] ||
                    topic.ideaStage}
                </span>
              )}

            <span>
              {topic.category?.name}
            </span>
          </div>

          <h1>{topic.title}</h1>

          <div className="forum-detail__meta">
           <div className="forum-author-identity">
  <span>
    {topic.authorInfo?.name ||
      "Bir Parti"}
  </span>

  <ExpertBadge
    profile={
      topic.authorInfo
        ?.expertProfile
    }
    compact
  />
</div>

            <span>
              {formatDate(
                topic.createdAt
              )}
            </span>

            {topic.isEdited && (
  <span>
    Düzenlendi:{" "}
    {formatDate(
      topic.editedAt
    )}
  </span>
)}

            <span>
              <MessageCircle
                size={15}
              />
              {topic.replyCount || 0}
            </span>

            <span>
              <Eye size={15} />
              {topic.viewCount || 0}
            </span>
            {canReportContent(
  topic.authorInfo?.id
) && (
  <button
    type="button"
    className="forum-report-button"
    onClick={() =>
      openReportModal({
        targetType: "topic",
        targetId: topic._id,
        targetLabel:
         "Bu konuyu bildir"
      })
    }
  >
    <Flag size={14} />
    Konuyu Bildir
  </button>
)}
          </div>
        </Container>
      </section>

      <section className="forum-detail-content">
        <Container className="forum-detail-content__container">
          <article className="forum-message forum-message--topic">
     <header>
  <div className="forum-message__author">
    <strong>
      {topic.authorInfo?.name ||
        "Bir Parti"}
    </strong>

    <ExpertBadge
      profile={
        topic.authorInfo
          ?.expertProfile
      }
    />
  </div>

  <span>
    {formatDate(
      topic.createdAt
    )}
  </span>
</header>

            <div className="forum-message__body">
              {topic.body
                .split("\n")
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
{topic.ideaStage &&
  topic.ideaStage !==
    "none" && (
    <div className="forum-idea-stage-panel">
      <span>
        <Lightbulb size={19} />
        Fikir ilerleme aşaması
      </span>

      <strong>
        {ideaStageLabels[
          topic.ideaStage
        ] || topic.ideaStage}
      </strong>

      {topic.ideaStageNote && (
        <p>
          {topic.ideaStageNote}
        </p>
      )}

      {(topic.linkedProject ||
        topic.isOnRoadmap) && (
        <div className="forum-idea-stage-panel__links">
          {topic.linkedProject && (
            <Link
              to={`/projelerimiz/${topic.linkedProject.slug}`}
            >
              <FolderKanban
                size={16}
              />

              {topic.linkedProject.title}
            </Link>
          )}

          {topic.isOnRoadmap && (
            <Link to="/yol-haritasi">
              <Route size={16} />
              Yol Haritasında Gör
            </Link>
          )}
        </div>
      )}

      {topic.ideaStageUpdatedAt && (
        <small>
          Son güncelleme:{" "}
          {formatDate(
            topic.ideaStageUpdatedAt
          )}
        </small>
      )}
    </div>
  )}
            <div className="forum-topic-interactions">
              {interactionError && (
                <div className="forum-interaction-error">
                  {interactionError}
                </div>
              )}

            <div className="forum-vote-control">
  <button
    type="button"
    className={`forum-interaction-button ${
      interaction.vote === 1
        ? "forum-interaction-button--active"
        : ""
    }`}
    onClick={() =>
      handleVote(1)
    }
    disabled={
      interactionPending
    }
    aria-label="Olumlu oy ver"
    title="Olumlu oy ver"
  >
    <ThumbsUp size={17} />

    <span>
      {topic.upvoteCount || 0}
    </span>
  </button>

  <button
    type="button"
    className={`forum-interaction-button forum-interaction-button--negative ${
      interaction.vote === -1
        ? "forum-interaction-button--active"
        : ""
    }`}
    onClick={() =>
      handleVote(-1)
    }
    disabled={
      interactionPending
    }
    aria-label="Olumsuz oy ver"
    title="Olumsuz oy ver"
  >
    <ThumbsDown size={17} />

    <span>
      {topic.downvoteCount || 0}
    </span>
  </button>
</div>

              <button
                type="button"
                className={`forum-support-button ${
                  interaction.isSupported
                    ? "forum-support-button--active"
                    : ""
                }`}
                onClick={
                  handleSupport
                }
                disabled={
                  interactionPending
                }
              >
                <Handshake size={17} />

                {interaction.isSupported
                  ? "Destekleniyor"
                  : "Destekle"}

                <strong>
                  {topic.supportCount ||
                    0}
                </strong>
              </button>

             {canManageSolved ? (
  <button
    type="button"
    className={`forum-solved-button ${
      topic.isSolved
        ? "forum-solved-button--active"
        : ""
    }`}
    onClick={handleSolved}
    disabled={interactionPending}
  >
    <CheckCircle2 size={17} />

    {topic.isSolved
      ? "Çözüldü · İşareti Kaldır"
      : "Çözüldü Olarak İşaretle"}
  </button>
) : (
  topic.isSolved && (
    <span className="forum-solved-badge">
      <CheckCircle2 size={17} />
      Çözüldü
    </span>
  )
)}
            </div>
          </article>

          <div className="forum-replies-heading">
            <h2>Yanıtlar</h2>

            <span>
              {pagination?.totalReplies ||
                0}{" "}
              yanıt
            </span>
          </div>

          <div className="forum-replies">
            {replies.map(
              (reply) => (
                <div
                  className="forum-thread"
                  key={reply._id}
                >
                  <article
  id={`yanit-${reply._id}`}
  className="forum-message"
>
                   <header>
  <div className="forum-message__author">
    <strong>
      {reply.authorInfo
        ?.name ||
        "Forum Üyesi"}
    </strong>

    <ExpertBadge
      profile={
        reply.authorInfo
          ?.expertProfile
      }
    />
  </div>

  <span>
    {formatDate(
      reply.createdAt
    )}
  </span>
                    </header>

                    <div className="forum-message__body">
                      {reply.body
                        .split("\n")
                        .filter(Boolean)
                        .map(
                          (
                            paragraph,
                            index
                          ) => (
                            <p
                              key={
                                index
                              }
                            >
                              {
                                paragraph
                              }
                            </p>
                          )
                        )}
                    </div>

                    <footer className="forum-message__footer">
  <div className="forum-message__actions">
    {renderReplyAction(
      reply
    )}

    {canReportContent(
      reply.authorInfo?.id
    ) && (
      <button
        type="button"
        className="forum-report-button"
        onClick={() =>
          openReportModal({
            targetType:
              "reply",

            targetId:
              reply._id,

            targetLabel:
              "Bu yanıtı bildir",
          })
        }
      >
        <Flag size={14} />
        Bildir
      </button>
    )}
  </div>
</footer>
                  </article>

                  {replyTarget?.id ===
                    reply._id &&
                    replyForm}

                  {reply.childReplies
                    ?.length > 0 && (
                    <div className="forum-child-replies">
                      {reply.childReplies.map(
                        (
                          childReply
                        ) => (
                          <div
                            className="forum-child-reply"
                            key={
                              childReply._id
                            }
                          >
                            <article
  id={`yanit-${childReply._id}`}
  className="forum-message forum-message--child"
>
     <header>
  <div className="forum-message__author">
    <strong>
      {childReply
        .authorInfo
        ?.name ||
        "Forum Üyesi"}
    </strong>

    <ExpertBadge
      profile={
        childReply
          .authorInfo
          ?.expertProfile
      }
    />
  </div>

  <span>
    {formatDate(
      childReply.createdAt
    )}
  </span>

  {childReply.isEdited && (
    <span>
      Düzenlendi:{" "}
      {formatDate(
        childReply.editedAt
      )}
    </span>
  )}
</header>

                              <div className="forum-message__body">
                                {childReply
                                  .replyToUserInfo
                                  ?.name && (
                                  <div className="forum-reply-mention">
                                    <AtSign
                                      size={
                                        15
                                      }
                                    />

                                    <span>
                                      <strong>
                                        {
                                          childReply
                                            .replyToUserInfo
                                            .name
                                        }
                                      </strong>{" "}
                                      kişisine
                                      yanıt
                                    </span>
                                  </div>
                                )}

                                {childReply.body
                                  .split(
                                    "\n"
                                  )
                                  .filter(
                                    Boolean
                                  )
                                  .map(
                                    (
                                      paragraph,
                                      index
                                    ) => (
                                      <p
                                        key={
                                          index
                                        }
                                      >
                                        {
                                          paragraph
                                        }
                                      </p>
                                    )
                                  )}
                              </div>

                          <footer className="forum-message__footer">
  <div className="forum-message__actions">
    {renderReplyAction(
      childReply
    )}

    {canReportContent(
      childReply.authorInfo?.id
    ) && (
      <button
        type="button"
        className="forum-report-button"
        onClick={() =>
          openReportModal({
            targetType:
              "reply",

            targetId:
              childReply._id,

            targetLabel:
              "Bu cevabı bildir"
          })
        }
      >
        <Flag size={14} />
        Bildir
      </button>
    )}
  </div>
</footer>
                            </article>

                            {replyTarget?.id ===
                              childReply._id &&
                              replyForm}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )}

            {replies.length === 0 && (
              <div className="forum-empty-replies">
                <MessageCircle
                  size={25}
                />

                <h3>
                  Henüz yanıt yazılmamış.
                </h3>

                <p>
                  İlk görüşü paylaşarak
                  tartışmayı başlatabilirsiniz.
                </p>
              </div>
            )}
          </div>

          <div className="forum-reply-area">
            {topic.status ===
            "locked" ? (
              <div className="forum-reply-notice">
                <Lock size={21} />

                <div>
                  <strong>
                    Bu konu kilitlenmiştir.
                  </strong>

                  <p>
                    Konuya yeni yanıt
                    gönderilemez.
                  </p>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="forum-reply-notice">
                <LogIn size={21} />

                <div>
                  <strong>
                    Yanıt yazmak için
                    giriş yapın.
                  </strong>

                  <p>
                   Topluluk tartışmasına
                    katılmak için
                    hesabınıza giriş
                    yapmanız gerekir.
                  </p>
                </div>

                <Link
                  to="/giris"
                  state={{
                    from:
                      `/forum/${slug}`,
                  }}
                  className="forum-primary-button"
                >
                  Giriş Yap
                </Link>
              </div>
            ) : !replyTarget ? (
              replyForm
            ) : null}
          </div>
        </Container>
      </section>
      <ForumReportModal
  isOpen={Boolean(
    reportTarget
  )}
  onClose={
    closeReportModal
  }
  targetType={
    reportTarget?.targetType
  }
  targetId={
    reportTarget?.targetId
  }
  targetLabel={
    reportTarget?.targetLabel
  }
/>
    </div>
  );
};

export default ForumTopicDetailPage;
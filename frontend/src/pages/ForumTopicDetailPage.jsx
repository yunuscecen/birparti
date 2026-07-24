import {
  ArrowLeft,
  AtSign,
  CornerUpLeft,
  Eye,
  Lock,
  LogIn,
  MessageCircle,
  Pin,
  Send,
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
  useParams,
} from "react-router-dom";

import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";

import {
  createForumReply,
  getForumTopicBySlug,
} from "../services/forumService";

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

  const queryClient =
    useQueryClient();

  const {
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

  const topic =
    topicQuery.data?.topic;

  const replies =
    topicQuery.data?.replies ||
    [];

  const pagination =
    topicQuery.data?.pagination;

  useEffect(() => {
    if (!topic) {
      return;
    }

    document.title =
      `${topic.title} | Bir Parti Forum`;

    return () => {
      document.title =
        "Bir Parti";
    };
  }, [topic]);

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

    await replyMutation.mutateAsync({
      slug,

      body:
        replyBody.trim(),

      replyToReplyId:
        replyTarget?.id ||
        null,
    });
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
          Forum konusu yükleniyor...
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
          Forum konusu bulunamadı.
        </h1>

        <Link to="/forum">
          Forum Sayfasına Dön
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
            Foruma Dön
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

            <span>
              {topic.category?.name}
            </span>
          </div>

          <h1>{topic.title}</h1>

          <div className="forum-detail__meta">
            <span>
              {topic.authorInfo?.name ||
                "Bir Parti"}
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
            </span>

            <span>
              <Eye size={15} />
              {topic.viewCount || 0}
            </span>
          </div>
        </Container>
      </section>

      <section className="forum-detail-content">
        <Container className="forum-detail-content__container">
          <article className="forum-message forum-message--topic">
            <header>
              <strong>
                {topic.authorInfo?.name ||
                  "Bir Parti"}
              </strong>

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
                  <article className="forum-message">
                    <header>
                      <strong>
                        {reply.authorInfo
                          ?.name ||
                          "Forum Üyesi"}
                      </strong>

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
                      {renderReplyAction(
                        reply
                      )}
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
                            <article className="forum-message forum-message--child">
                              <header>
                                <strong>
                                  {childReply
                                    .authorInfo
                                    ?.name ||
                                    "Forum Üyesi"}
                                </strong>

                                <span>
                                  {formatDate(
                                    childReply.createdAt
                                  )}
                                </span>
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
                                {renderReplyAction(
                                  childReply
                                )}
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
                    Forum tartışmasına
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
    </div>
  );
};

export default ForumTopicDetailPage;
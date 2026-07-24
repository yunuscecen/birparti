import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  EyeOff,
  FileText,
  Lock,
  MessageCircle,
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
            status,
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
                              className={`account-forum-status account-forum-status--${topic.status}`}
                            >
                              {
                                topicStatusLabels[
                                  topic
                                    .status
                                ]
                              }
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
                          <Link
                            to={`/forum/${topic.slug}`}
                            className="account-forum-link"
                          >
                            <ExternalLink
                              size={
                                16
                              }
                            />
                            Konuyu Aç
                          </Link>
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
                              className={`account-forum-status account-forum-status--reply-${reply.status}`}
                            >
                              {
                                replyStatusLabels[
                                  reply
                                    .status
                                ]
                              }
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
                          [
                            "open",
                            "locked",
                          ].includes(
                            reply.topic
                              .status
                          ) && (
                            <Link
                              to={`/forum/${reply.topic.slug}`}
                              className="account-forum-link"
                            >
                              <ExternalLink
                                size={
                                  16
                                }
                              />
                              Konuya Git
                            </Link>
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
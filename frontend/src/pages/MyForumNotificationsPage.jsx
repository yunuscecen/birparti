import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  ExternalLink,
  MessageCircle,
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

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  getMyForumNotifications,
  markAllForumNotificationsRead,
  markForumNotificationRead,
} from "../services/accountForumService";

const notificationTypeLabels = {
  topic_reply:
    "Konunuza yanıt geldi",

  reply_reply:
    "Yanıtınıza cevap geldi",

  report_reviewed:
    "Bildiriminiz incelendi",

  report_dismissed:
    "Bildiriminiz sonuçlandırıldı",

  report_action_taken:
    "Bildiriminiz için işlem yapıldı",
};

const getNotificationIcon = (
  type
) => {
  if (
    type === "topic_reply" ||
    type === "reply_reply"
  ) {
    return MessageCircle;
  }

  if (
    type ===
    "report_action_taken"
  ) {
    return ShieldCheck;
  }

  return Bell;
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

const getSafeNotificationLink = (
  link
) => {
  if (
    typeof link === "string" &&
    link.startsWith("/")
  ) {
    return link;
  }

  return "/hesabim/forum-bildirimlerim";
};

const MyForumNotificationsPage =
  () => {
    const navigate =
      useNavigate();

    const queryClient =
      useQueryClient();

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

    const unreadOnly =
      searchParams.get(
        "okunmamis"
      ) === "1";

    const [
      openingNotificationId,
      setOpeningNotificationId,
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
        "Forum Bildirimlerim | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const notificationsQuery =
      useQuery({
        queryKey: [
          "my-forum-notifications",
          page,
          unreadOnly,
        ],

        queryFn: () =>
          getMyForumNotifications({
            page,
            unreadOnly,
          }),

        retry: false,
      });

    const refreshNotifications =
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "my-forum-notifications",
          ],
        });
      };

    const markReadMutation =
      useMutation({
        mutationFn:
          markForumNotificationRead,

        onSuccess:
          refreshNotifications,

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Bildirim okundu olarak işaretlenemedi."
              ),
          });
        },
      });

    const markAllMutation =
      useMutation({
        mutationFn:
          markAllForumNotificationsRead,

        onSuccess: async () => {
          setFeedback({
            type: "success",

            message:
              "Tüm forum bildirimleri okundu olarak işaretlendi.",
          });

          await refreshNotifications();
        },

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              getErrorMessage(
                error,
                "Bildirimler güncellenemedi."
              ),
          });
        },
      });

    const notifications =
      notificationsQuery.data
        ?.notifications || [];

    const unreadCount =
      notificationsQuery.data
        ?.unreadCount || 0;

    const pagination =
      notificationsQuery.data
        ?.pagination;

    const updatePage = (
      nextPage
    ) => {
      const nextParams =
        new URLSearchParams(
          searchParams
        );

      if (nextPage > 1) {
        nextParams.set(
          "sayfa",
          String(nextPage)
        );
      } else {
        nextParams.delete(
          "sayfa"
        );
      }

      setSearchParams(
        nextParams
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const toggleUnreadOnly =
      () => {
        const nextParams =
          new URLSearchParams(
            searchParams
          );

        nextParams.delete(
          "sayfa"
        );

        if (unreadOnly) {
          nextParams.delete(
            "okunmamis"
          );
        } else {
          nextParams.set(
            "okunmamis",
            "1"
          );
        }

        setSearchParams(
          nextParams
        );
      };

    const handleOpenNotification =
      async (notification) => {
        const targetLink =
          getSafeNotificationLink(
            notification.link
          );

        setOpeningNotificationId(
          notification._id
        );

        try {
          if (
            !notification.isRead
          ) {
            await markReadMutation.mutateAsync(
              notification._id
            );
          }
        } catch {
          /*
           * Hata mesajı mutation içindeki
           * onError tarafından gösterilir.
           * Kullanıcının içeriği açması
           * engellenmez.
           */
        } finally {
          setOpeningNotificationId(
            ""
          );

          navigate(
            targetLink
          );
        }
      };

    return (
      <div className="forum-notifications-page">
        <section className="forum-notifications-hero">
          <Container>
            <div className="forum-notifications-hero__content">
              <div>
                <p className="forum-notifications-hero__eyebrow">
                  Hesabım
                </p>

                <h1>
                  Forum Bildirimlerim
                </h1>

                <p>
                  Forum konularınıza gelen
                  yanıtları, cevapları ve
                  bildirdiğiniz içeriklerin
                  sonuçlarını buradan takip
                  edebilirsiniz.
                </p>
              </div>

              <div className="forum-notifications-hero__counter">
                <BellRing size={25} />

                <span>
                  Okunmamış bildirim
                </span>

                <strong>
                  {unreadCount}
                </strong>
              </div>
            </div>
          </Container>
        </section>

        <section className="forum-notifications-content">
          <Container>
            <div className="forum-notifications-toolbar">
              <div className="forum-notifications-tabs">
                <button
                  type="button"
                  className={
                    !unreadOnly
                      ? "forum-notifications-tab forum-notifications-tab--active"
                      : "forum-notifications-tab"
                  }
                  onClick={() => {
                    if (
                      unreadOnly
                    ) {
                      toggleUnreadOnly();
                    }
                  }}
                >
                  <Bell size={17} />
                  Tüm Bildirimler
                </button>

                <button
                  type="button"
                  className={
                    unreadOnly
                      ? "forum-notifications-tab forum-notifications-tab--active"
                      : "forum-notifications-tab"
                  }
                  onClick={() => {
                    if (
                      !unreadOnly
                    ) {
                      toggleUnreadOnly();
                    }
                  }}
                >
                  <Circle size={15} />
                  Okunmamışlar

                  {unreadCount > 0 && (
                    <span className="forum-notifications-tab__count">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="forum-notifications-toolbar__actions">
                <Link
                  to="/hesabim/forum-hareketlerim"
                  className="forum-secondary-button"
                >
                  <MessageCircle
                    size={16}
                  />
                  Forum Hareketlerim
                </Link>

                <button
                  type="button"
                  className="forum-primary-button"
                  disabled={
                    unreadCount === 0 ||
                    markAllMutation.isPending
                  }
                  onClick={() =>
                    markAllMutation.mutate()
                  }
                >
                  <CheckCheck
                    size={17}
                  />

                  {markAllMutation.isPending
                    ? "Güncelleniyor..."
                    : "Tümünü Okundu Yap"}
                </button>
              </div>
            </div>

            {feedback.message && (
              <div
                className={`forum-notification-feedback ${
                  feedback.type ===
                  "error"
                    ? "forum-notification-feedback--error"
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

            <div className="forum-notifications-panel">
              {notificationsQuery.isLoading ? (
                <div className="forum-notifications-state">
                  <span className="auth-spinner" />

                  <p>
                    Bildirimler
                    yükleniyor...
                  </p>
                </div>
              ) : notificationsQuery.isError ? (
                <div className="forum-notifications-state">
                  <Bell size={31} />

                  <h2>
                    Bildirimler alınamadı.
                  </h2>

                  <p>
                    Forum bildirimleri
                    yüklenirken bir sorun
                    oluştu.
                  </p>

                  <button
                    type="button"
                    className="forum-primary-button"
                    onClick={() =>
                      notificationsQuery.refetch()
                    }
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : notifications.length ===
                0 ? (
                <div className="forum-notifications-state">
                  <Bell size={31} />

                  <h2>
                    {unreadOnly
                      ? "Okunmamış bildiriminiz yok."
                      : "Henüz forum bildiriminiz yok."}
                  </h2>

                  <p>
                    {unreadOnly
                      ? "Tüm forum bildirimlerinizi okudunuz."
                      : "Konularınıza yanıt veya cevap geldiğinde burada görüntülenecek."}
                  </p>
                </div>
              ) : (
                <div className="forum-notifications-list">
                  {notifications.map(
                    (notification) => {
                      const NotificationIcon =
                        getNotificationIcon(
                          notification.type
                        );

                      const isOpening =
                        openingNotificationId ===
                        notification._id;

                      return (
                        <button
                          type="button"
                          key={
                            notification._id
                          }
                          className={`forum-notification-item ${
                            notification.isRead
                              ? "forum-notification-item--read"
                              : "forum-notification-item--unread"
                          }`}
                          disabled={
                            isOpening
                          }
                          onClick={() =>
                            handleOpenNotification(
                              notification
                            )
                          }
                        >
                          <span className="forum-notification-item__icon">
                            <NotificationIcon
                              size={21}
                            />
                          </span>

                          <span className="forum-notification-item__content">
                            <span className="forum-notification-item__meta">
                              <span>
                                {notificationTypeLabels[
                                  notification
                                    .type
                                ] ||
                                  "Forum bildirimi"}
                              </span>

                              <span>
                                {formatDate(
                                  notification.createdAt
                                )}
                              </span>

                              {!notification.isRead && (
                                <span className="forum-notification-item__unread-label">
                                  Yeni
                                </span>
                              )}
                            </span>

                            <strong>
                              {notification.title}
                            </strong>

                            <span className="forum-notification-item__message">
                              {notification.message}
                            </span>

                            {notification.actorInfo?.name && (
                              <span className="forum-notification-item__actor">
                                İşlemi yapan:{" "}
                                <strong>
                                  {
                                    notification
                                      .actorInfo
                                      .name
                                  }
                                </strong>
                              </span>
                            )}
                          </span>

                          <span className="forum-notification-item__open">
                            {isOpening
                              ? "Açılıyor..."
                              : "Görüntüle"}

                            <ExternalLink
                              size={16}
                            />
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {pagination &&
                pagination.totalPages >
                  1 && (
                  <div className="forum-notifications-pagination">
                    <span>
                      Toplam{" "}
                      {
                        pagination.totalNotifications
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
                          updatePage(
                            pagination.page -
                              1
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
                          updatePage(
                            pagination.page +
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
            </div>
          </Container>
        </section>
      </div>
    );
  };

export default MyForumNotificationsPage;
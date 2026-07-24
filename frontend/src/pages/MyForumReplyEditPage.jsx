import {
  ArrowLeft,
  Save,
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

import Container from "../components/common/Container";

import {
  getMyForumReplyForEdit,
  updateMyForumReply,
} from "../services/accountForumService";

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data
      ?.message ||
    error?.message ||
    fallback
  );
};

const MyForumReplyEditPage =
  () => {
    const {
      replyId,
    } = useParams();

    const navigate =
      useNavigate();

    const queryClient =
      useQueryClient();

    const [
      body,
      setBody,
    ] = useState("");

    const [
      formError,
      setFormError,
    ] = useState("");

    useEffect(() => {
      document.title =
        "Forum Yanıtını Düzenle | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const replyQuery =
      useQuery({
        queryKey: [
          "my-forum-reply-edit",
          replyId,
        ],

        queryFn: () =>
          getMyForumReplyForEdit(
            replyId
          ),

        enabled:
          Boolean(replyId),

        retry: false,
      });

    const reply =
      replyQuery.data?.reply;

    useEffect(() => {
      if (!reply) {
        return;
      }

      setBody(
        reply.body || ""
      );
    }, [reply]);

    const updateMutation =
      useMutation({
        mutationFn:
          updateMyForumReply,

        onSuccess: async (
          data
        ) => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [
                "forum-topic",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "forum-topics",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "my-forum-replies",
              ],
            }),
          ]);

          navigate(
            `/forum/${data.reply.topic.slug}` +
              `#yanit-${data.reply._id}`,
            {
              replace: true,
            }
          );
        },

        onError: (error) => {
          setFormError(
            getErrorMessage(
              error,
              "Forum yanıtı güncellenemedi."
            )
          );
        },
      });

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        if (
          body.trim().length <
          2
        ) {
          setFormError(
            "Yanıt en az 2 karakter olmalıdır."
          );

          return;
        }

        setFormError("");

        try {
          await updateMutation.mutateAsync({
            replyId,
            body:
              body.trim(),
          });
        } catch {
          /*
           * Hata mesajı mutation içindeki
           * onError tarafından gösterilir.
           */
        }
      };

    if (
      replyQuery.isLoading
    ) {
      return (
        <div className="forum-state forum-state--page">
          <span className="auth-spinner" />

          <p>
            Forum yanıtı
            yükleniyor...
          </p>
        </div>
      );
    }

    if (
      replyQuery.isError ||
      !reply
    ) {
      return (
        <div className="forum-state forum-state--page">
          <h1>
            Düzenlenebilir forum yanıtı bulunamadı.
          </h1>

          <Link to="/hesabim/forum-hareketlerim?sekme=yanitlar">
            Forum Yanıtlarıma Dön
          </Link>
        </div>
      );
    }

    return (
      <div className="forum-page">
        <section className="forum-hero forum-create-hero">
          <Container>
            <Link
              to="/hesabim/forum-hareketlerim?sekme=yanitlar"
              className="forum-detail__back"
            >
              <ArrowLeft
                size={17}
              />

              Forum Yanıtlarıma Dön
            </Link>

            <p className="forum-hero__eyebrow">
              Kendi içeriğiniz
            </p>

            <h1>
              Forum Yanıtını Düzenle
            </h1>

            <p>
              “{reply.topic?.title}”
              başlıklı konuya yazdığınız
              yanıtı
              güncelleyebilirsiniz.
            </p>
          </Container>
        </section>

        <section className="forum-content">
          <Container className="forum-create-container">
            <form
              className="forum-create-form"
              onSubmit={
                handleSubmit
              }
              noValidate
            >
              {formError && (
                <div className="forum-form-error">
                  {formError}
                </div>
              )}

              <div className="forum-form-field">
                <label htmlFor="edit-forum-reply-body">
                  Yanıtınız
                </label>

                <textarea
                  id="edit-forum-reply-body"
                  value={body}
                  onChange={(event) =>
                    setBody(
                      event.target.value
                    )
                  }
                  rows={10}
                  maxLength={15000}
                  required
                />

                <small>
                  {body.length}/15000
                  karakter
                </small>
              </div>

              <div className="forum-create-form__actions">
                <Link
                  to={
                    `/forum/${reply.topic?.slug}` +
                    `#yanit-${reply._id}`
                  }
                  className="forum-secondary-button"
                >
                  Vazgeç
                </Link>

                <button
                  type="submit"
                  className="forum-primary-button"
                  disabled={
                    updateMutation.isPending
                  }
                >
                  <Save size={17} />

                  {updateMutation.isPending
                    ? "Kaydediliyor..."
                    : "Yanıtı Güncelle"}
                </button>
              </div>
            </form>
          </Container>
        </section>
      </div>
    );
  };

export default MyForumReplyEditPage;
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
  getForumCategories,
} from "../services/forumService";

import {
  getMyForumTopicForEdit,
  updateMyForumTopic,
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

const MyForumTopicEditPage =
  () => {
    const {
      topicId,
    } = useParams();

    const navigate =
      useNavigate();

    const queryClient =
      useQueryClient();

    const [
      formData,
      setFormData,
    ] = useState({
      title: "",
      body: "",
      category: "",
    });

    const [
      formError,
      setFormError,
    ] = useState("");

    useEffect(() => {
      document.title =
        "Forum Konusunu Düzenle | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const topicQuery =
      useQuery({
        queryKey: [
          "my-forum-topic-edit",
          topicId,
        ],

        queryFn: () =>
          getMyForumTopicForEdit(
            topicId
          ),

        enabled:
          Boolean(topicId),

        retry: false,
      });

    const categoriesQuery =
      useQuery({
        queryKey: [
          "forum-categories",
        ],

        queryFn:
          getForumCategories,
      });

    const topic =
      topicQuery.data?.topic;

    useEffect(() => {
      if (!topic) {
        return;
      }

      setFormData({
        title:
          topic.title || "",

        body:
          topic.body || "",

        category:
          topic.category?._id ||
          topic.category ||
          "",
      });
    }, [topic]);

    const updateMutation =
      useMutation({
        mutationFn:
          updateMyForumTopic,

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
                "my-forum-topics",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "my-forum-overview",
              ],
            }),
          ]);

          navigate(
            `/forum/${data.topic.slug}`,
            {
              replace: true,
            }
          );
        },

        onError: (error) => {
          setFormError(
            getErrorMessage(
              error,
              "Forum konusu güncellenemedi."
            )
          );
        },
      });

    const handleChange = (
      event
    ) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]:
            value,
        })
      );
    };

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        if (
          formData.title.trim()
            .length < 5
        ) {
          setFormError(
            "Konu başlığı en az 5 karakter olmalıdır."
          );

          return;
        }

        if (
          formData.body.trim()
            .length < 20
        ) {
          setFormError(
            "Konu içeriği en az 20 karakter olmalıdır."
          );

          return;
        }

        if (
          !formData.category
        ) {
          setFormError(
            "Bir forum kategorisi seçmelisiniz."
          );

          return;
        }

        setFormError("");

        try {
          await updateMutation.mutateAsync({
            topicId,

            formData: {
              title:
                formData.title.trim(),

              body:
                formData.body.trim(),

              category:
                formData.category,
            },
          });
        } catch {
          /*
           * Hata mesajı mutation içindeki
           * onError tarafından gösterilir.
           */
        }
      };

    if (
      topicQuery.isLoading
    ) {
      return (
        <div className="forum-state forum-state--page">
          <span className="auth-spinner" />

          <p>
            Forum konusu
            yükleniyor...
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
            Düzenlenebilir forum konusu bulunamadı.
          </h1>

          <Link to="/hesabim/forum-hareketlerim">
            Forum Hareketlerime Dön
          </Link>
        </div>
      );
    }

    const categories =
      categoriesQuery.data
        ?.categories || [];

    return (
      <div className="forum-page">
        <section className="forum-hero forum-create-hero">
          <Container>
            <Link
              to="/hesabim/forum-hareketlerim"
              className="forum-detail__back"
            >
              <ArrowLeft
                size={17}
              />

              Forum Hareketlerime Dön
            </Link>

            <p className="forum-hero__eyebrow">
              Kendi içeriğiniz
            </p>

            <h1>
              Forum Konusunu Düzenle
            </h1>

            <p>
              Konunun adresi değişmeden
              başlık, kategori ve içerik
              bilgilerini
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
                <label htmlFor="edit-forum-topic-category">
                  Kategori
                </label>

                <select
                  id="edit-forum-topic-category"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Kategori seçin
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category._id
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="forum-form-field">
                <label htmlFor="edit-forum-topic-title">
                  Konu başlığı
                </label>

                <input
                  id="edit-forum-topic-title"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={220}
                  required
                />

                <small>
                  {
                    formData.title
                      .length
                  }
                  /220 karakter
                </small>
              </div>

              <div className="forum-form-field">
                <label htmlFor="edit-forum-topic-body">
                  Konu içeriği
                </label>

                <textarea
                  id="edit-forum-topic-body"
                  name="body"
                  value={
                    formData.body
                  }
                  onChange={
                    handleChange
                  }
                  rows={12}
                  maxLength={30000}
                  required
                />

                <small>
                  {
                    formData.body
                      .length
                  }
                  /30000 karakter
                </small>
              </div>

              <div className="forum-create-form__actions">
                <Link
                  to={`/forum/${topic.slug}`}
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
                    : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </Container>
        </section>
      </div>
    );
  };

export default MyForumTopicEditPage;
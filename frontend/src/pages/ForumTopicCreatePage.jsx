import {
  ArrowLeft,
  Send,
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
} from "react-router-dom";

import Container from "../components/common/Container";
import { useAuth } from "../context/AuthContext";

import {
  createForumTopic,
  getForumCategories,
} from "../services/forumService";

const privilegedRoles = [
  "moderator",
  "admin",
  "superAdmin",
];

const ForumTopicCreatePage = () => {
  const navigate = useNavigate();
  const queryClient =
    useQueryClient();

const {
  isAuthenticated,
} = useAuth();

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
      "Yeni Forum Konusu | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

 const canCreateTopic =
    isAuthenticated;

  const categoriesQuery =
    useQuery({
      queryKey: [
        "forum-categories",
      ],

      queryFn:
        getForumCategories,
    });

const createMutation =
  useMutation({
    mutationFn:
      createForumTopic,

    onSuccess: async (
     
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "forum-topics",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "forum-categories",
          ],
        }),

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
      ]);

    navigate(
  "/hesabim/forum-hareketlerim",
  {
    replace: true,
  }
);
    },

    onError: (error) => {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          "Forum konusu oluşturulamadı."
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
        [name]: value,
      })
    );
  };

  const handleSubmit = async (
    event
  ) => {
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

    if (!formData.category) {
      setFormError(
        "Bir forum kategorisi seçmelisiniz."
      );

      return;
    }

    setFormError("");

    await createMutation.mutateAsync(
      {
        title:
          formData.title.trim(),

        body:
          formData.body.trim(),

        category:
          formData.category,
      }
    );
  };

  if (!canCreateTopic) {
    return (
      <div className="forum-page">
        <section className="forum-content">
          <Container>
            <div className="forum-permission-state">
            <h1>
  Giriş yapmanız gerekiyor.
</h1>

<p>
  Yeni bir Topluluk konusu
  gönderebilmek için hesabınıza
  giriş yapmalısınız.
</p>

              <Link
                to="/forum"
                className="forum-primary-button"
              >
                <ArrowLeft
                  size={17}
                />
                Foruma Dön
              </Link>
            </div>
          </Container>
        </section>
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
            to="/forum"
            className="forum-detail__back"
          >
            <ArrowLeft size={17} />
            Foruma Dön
          </Link>

          <p className="forum-hero__eyebrow">
            Görüşünüzü paylaşın
          </p>

          <h1>Yeni Konu Aç</h1>

        <p>
  Konunuz gönderildikten sonra
  yönetici incelemesine alınacaktır.
  Onaylanan konular Topluluk
  sayfasında yayınlanır.
</p>
        </Container>
      </section>

      <section className="forum-content">
        <Container className="forum-create-container">
          <form
            className="forum-create-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {formError && (
              <div className="forum-form-error">
                {formError}
              </div>
            )}

            <div className="forum-form-field">
              <label htmlFor="forum-topic-category">
                Kategori
              </label>

              <select
                id="forum-topic-category"
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
              <label htmlFor="forum-topic-title">
                Konu başlığı
              </label>

              <input
                id="forum-topic-title"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                placeholder="Konunun ne hakkında olduğunu açıklayın"
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
              <label htmlFor="forum-topic-body">
                Konu içeriği
              </label>

              <textarea
                id="forum-topic-body"
                name="body"
                value={
                  formData.body
                }
                onChange={
                  handleChange
                }
                placeholder="Düşüncenizi veya önerinizi ayrıntılı şekilde paylaşın..."
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
                to="/forum"
                className="forum-secondary-button"
              >
                Vazgeç
              </Link>

              <button
                type="submit"
                className="forum-primary-button"
                disabled={
                  createMutation.isPending
                }
              >
                <Send size={17} />

               {createMutation.isPending
  ? "Konu gönderiliyor..."
  : "Onaya Gönder"}
              </button>
            </div>
          </form>
        </Container>
      </section>
    </div>
  );
};

export default ForumTopicCreatePage;
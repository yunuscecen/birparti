import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
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
} from "react-router-dom";

import {
  deleteAdminBlogPost,
  getAdminBlogCategories,
  getAdminBlogPosts,
} from "../../services/adminBlogService";

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşivlendi",
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
};

const AdminBlogPostsPage = () => {
  const queryClient =
    useQueryClient();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    feedback,
    setFeedback,
  ] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    document.title =
      "Blog Yönetimi | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  useEffect(() => {
    if (
      !location.state?.message
    ) {
      return;
    }

    setFeedback(
      location.state.message
    );

    navigate(
      location.pathname,
      {
        replace: true,
        state: {},
      }
    );
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setSearch(
          searchInput.trim()
        );

        setPage(1);
      }, 350);

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [searchInput]);

  const categoriesQuery =
    useQuery({
      queryKey: [
        "admin-blog-categories",
      ],

      queryFn:
        getAdminBlogCategories,
    });

  const postsQuery =
    useQuery({
      queryKey: [
        "admin-blog-posts",
        page,
        search,
        category,
        status,
      ],

      queryFn: () =>
        getAdminBlogPosts({
          page,
          search,
          category,
          status,
        }),
    });

  const deleteMutation =
    useMutation({
      mutationFn:
        deleteAdminBlogPost,

      onSuccess: async () => {
        setFeedback(
          "Blog yazısı silindi."
        );

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "admin-blog-posts",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "blog-posts",
            ],
          }),
        ]);
      },

      onError: (error) => {
        setFeedback(
          error.message ||
            "Blog yazısı silinemedi."
        );
      },
    });

  const handleDelete = (
    post
  ) => {
    const confirmed =
      window.confirm(
        `"${post.title}" yazısını silmek istediğinize emin misiniz?`
      );

    if (confirmed) {
      deleteMutation.mutate(
        post._id
      );
    }
  };

  const categories =
    categoriesQuery.data
      ?.categories || [];

  const posts =
    postsQuery.data
      ?.posts || [];

  const pagination =
    postsQuery.data
      ?.pagination;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Blog yönetimi</p>
          <h1>Blog Yazıları</h1>
        </div>

        <Link
          to="/admin/blog/yeni"
          className="admin-primary-button"
        >
          <Plus size={17} />
          Yeni Yazı
        </Link>
      </div>

      {feedback && (
        <div className="admin-feedback">
          {feedback}

          <button
            type="button"
            onClick={() =>
              setFeedback("")
            }
          >
            Kapat
          </button>
        </div>
      )}

      <section className="admin-panel-card">
        <div className="admin-user-filters">
          <div className="admin-search">
            <Search size={19} />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Blog yazılarında ara..."
            />
          </div>

          <select
            value={category}
            onChange={(event) => {
              setCategory(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="">
              Tüm kategoriler
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              )
            )}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="">
              Tüm durumlar
            </option>

            <option value="draft">
              Taslak
            </option>

            <option value="published">
              Yayında
            </option>

            <option value="archived">
              Arşivlendi
            </option>
          </select>
        </div>

        {postsQuery.isLoading ? (
          <div className="admin-state">
            <span className="auth-spinner" />

            <p>
              Blog yazıları
              yükleniyor...
            </p>
          </div>
        ) : postsQuery.isError ? (
          <div className="admin-state">
            <h2>
              Blog yazıları alınamadı.
            </h2>

            <button
              type="button"
              onClick={() =>
                postsQuery.refetch()
              }
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Blog Yazısı</th>
                  <th>Kategori</th>
                  <th>Durum</th>
                  <th>Öne Çıkan</th>
                  <th>Yayın Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {posts.map(
                  (post) => (
                    <tr key={post._id}>
                      <td>
                        <strong>
                          {post.title}
                        </strong>

                        <span>
                          /{post.slug}
                        </span>
                      </td>

                      <td>
                        {post.category
                          ?.name || "—"}
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status--${post.status}`}
                        >
                          {statusLabels[
                            post.status
                          ] ||
                            post.status}
                        </span>
                      </td>

                      <td>
                        {post.isFeatured
                          ? "Evet"
                          : "Hayır"}
                      </td>

                      <td>
                        {formatDate(
                          post.publishedAt
                        )}
                      </td>

                      <td>
                        <div className="admin-inline-actions">
                          <Link
                            to={`/admin/blog/${post._id}/duzenle`}
                          >
                            <Pencil
                              size={16}
                            />
                            Düzenle
                          </Link>

                          <button
                            type="button"
                            className="admin-danger-button"
                            onClick={() =>
                              handleDelete(
                                post
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {posts.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      Blog yazısı
                      bulunamadı.
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
              Toplam{" "}
              {pagination.totalPosts}{" "}
              blog yazısı
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
                        current - 1,
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
                {pagination.totalPages}
              </strong>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
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

export default AdminBlogPostsPage;
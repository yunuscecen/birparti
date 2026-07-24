import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import AdminBlogPostForm from "../../components/admin/AdminBlogPostForm";

import {
  createAdminBlogPost,
  getAdminBlogCategories,
} from "../../services/adminBlogService";

const AdminBlogPostCreatePage =
  () => {
    const navigate =
      useNavigate();

    const queryClient =
      useQueryClient();

    const [
      serverError,
      setServerError,
    ] = useState("");

    useEffect(() => {
      document.title =
        "Yeni Blog Yazısı | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const categoriesQuery =
      useQuery({
        queryKey: [
          "admin-blog-categories",
        ],

        queryFn:
          getAdminBlogCategories,
      });

    const createMutation =
      useMutation({
        mutationFn:
          createAdminBlogPost,

        onSuccess: async () => {
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

          navigate(
            "/admin/blog",
            {
              replace: true,

              state: {
                message:
                  "Blog yazısı başarıyla oluşturuldu.",
              },
            }
          );
        },

        onError: (error) => {
          setServerError(
            error.message ||
              "Blog yazısı oluşturulamadı."
          );
        },
      });

    const handleSubmit = async (
      formData
    ) => {
      setServerError("");

      await createMutation.mutateAsync(
        formData
      );
    };

    if (
      categoriesQuery.isLoading
    ) {
      return (
        <div className="admin-state">
          <span className="auth-spinner" />

          <p>
            Blog kategorileri
            yükleniyor...
          </p>
        </div>
      );
    }

    const categories =
      categoriesQuery.data
        ?.categories || [];

    return (
      <div className="admin-page">
        <div className="admin-page__heading">
          <div>
            <p>Blog yönetimi</p>

            <h1>
              Yeni Blog Yazısı
            </h1>
          </div>

          <span>
            Yeni blog yazısının
            içeriğini ve yayın
            durumunu belirleyin.
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="admin-empty-warning">
            <h2>
              Önce bir blog
              kategorisi oluşturun.
            </h2>

            <p>
              Blog yazısı
              oluşturabilmek için en
              az bir kategori
              bulunmalıdır.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/blog-kategorileri"
                )
              }
            >
              Blog Kategorilerine Git
            </button>
          </div>
        ) : (
          <AdminBlogPostForm
            categories={categories}
            isSaving={
              createMutation.isPending
            }
            serverError={
              serverError
            }
            onSubmit={
              handleSubmit
            }
          />
        )}
      </div>
    );
  };

export default AdminBlogPostCreatePage;
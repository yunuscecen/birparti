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
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminBlogPostForm from "../../components/admin/AdminBlogPostForm";

import {
  getAdminBlogCategories,
  getAdminBlogPostById,
  updateAdminBlogPost,
} from "../../services/adminBlogService";

const AdminBlogPostEditPage =
  () => {
    const { postId } =
      useParams();

    const navigate =
      useNavigate();

    const queryClient =
      useQueryClient();

    const [
      serverError,
      setServerError,
    ] = useState("");

    const postQuery =
      useQuery({
        queryKey: [
          "admin-blog-post",
          postId,
        ],

        queryFn: () =>
          getAdminBlogPostById(
            postId
          ),

        enabled:
          Boolean(postId),

        retry: false,
      });

    const categoriesQuery =
      useQuery({
        queryKey: [
          "admin-blog-categories",
        ],

        queryFn:
          getAdminBlogCategories,
      });

    const post =
      postQuery.data?.post;

    useEffect(() => {
      document.title =
        post?.title
          ? `${post.title} Düzenle | Bir Parti`
          : "Blog Yazısı Düzenle | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, [post]);

    const updateMutation =
      useMutation({
        mutationFn:
          updateAdminBlogPost,

        onSuccess: async (
          data
        ) => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [
                "admin-blog-posts",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "admin-blog-post",
                postId,
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "blog-posts",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "blog-post",
                data.post?.slug,
              ],
            }),
          ]);

          navigate(
            "/admin/blog",
            {
              replace: true,

              state: {
                message:
                  "Blog yazısı başarıyla güncellendi.",
              },
            }
          );
        },

        onError: (error) => {
          setServerError(
            error.message ||
              "Blog yazısı güncellenemedi."
          );
        },
      });

    const handleSubmit = async (
      formData
    ) => {
      setServerError("");

      await updateMutation.mutateAsync({
        postId,
        formData,
      });
    };

    const isLoading =
      postQuery.isLoading ||
      categoriesQuery.isLoading;

    if (isLoading) {
      return (
        <div className="admin-state">
          <span className="auth-spinner" />

          <p>
            Blog yazısı
            yükleniyor...
          </p>
        </div>
      );
    }

    if (
      postQuery.isError ||
      !post
    ) {
      return (
        <div className="admin-state">
          <h1>
            Blog yazısı
            bulunamadı.
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/blog"
              )
            }
          >
            Blog Yazılarına Dön
          </button>
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
              Yazıyı Düzenle
            </h1>
          </div>

          <span>
            {post.title}
          </span>
        </div>

        <AdminBlogPostForm
          post={post}
          categories={categories}
          isSaving={
            updateMutation.isPending
          }
          serverError={
            serverError
          }
          onSubmit={
            handleSubmit
          }
        />
      </div>
    );
  };

export default AdminBlogPostEditPage;
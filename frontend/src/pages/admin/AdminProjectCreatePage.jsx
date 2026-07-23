import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import AdminProjectForm from "../../components/admin/AdminProjectForm";

import {
  createAdminProject,
  getAdminProjectCategories,
} from "../../services/adminProjectService";

const AdminProjectCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [serverError, setServerError] =
    useState("");

  useEffect(() => {
    document.title =
      "Yeni Proje | Bir Parti Yönetim";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  const categoriesQuery = useQuery({
    queryKey: ["admin-project-categories"],
    queryFn: getAdminProjectCategories,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProject,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-projects"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
      ]);

      navigate("/admin/projeler", {
        replace: true,
        state: {
          message: "Proje başarıyla oluşturuldu.",
        },
      });
    },

    onError: (error) => {
      setServerError(
        error.message ||
          "Proje oluşturulurken bir hata oluştu."
      );
    },
  });

  const handleSubmit = async (formData) => {
    setServerError("");

    await createMutation.mutateAsync(formData);
  };

  if (categoriesQuery.isLoading) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />
        <p>Kategoriler yükleniyor...</p>
      </div>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <div className="admin-state">
        <h1>Kategoriler yüklenemedi.</h1>

        <p>
          Proje oluşturmadan önce kategorilerin
          alınması gerekiyor.
        </p>

        <button
          type="button"
          onClick={() =>
            categoriesQuery.refetch()
          }
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const categories =
    categoriesQuery.data?.categories || [];

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Proje yönetimi</p>

          <h1>Yeni Proje</h1>
        </div>

        <span>
          Proje içeriğini hazırlayın ve yayın
          durumunu belirleyin.
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="admin-empty-warning">
          <h2>Önce bir kategori oluşturmalısınız.</h2>

          <p>
            Proje ekleyebilmek için en az bir proje
            kategorisi bulunmalıdır.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/proje-kategorileri"
              )
            }
          >
            Kategori Yönetimine Git
          </button>
        </div>
      ) : (
        <AdminProjectForm
          categories={categories}
          isSaving={createMutation.isPending}
          serverError={serverError}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AdminProjectCreatePage;
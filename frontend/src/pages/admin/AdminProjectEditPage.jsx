import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminProjectForm from "../../components/admin/AdminProjectForm";

import {
  getAdminProjectById,
  getAdminProjectCategories,
  updateAdminProject,
} from "../../services/adminProjectService";

const AdminProjectEditPage = () => {
  const { projectId } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [serverError, setServerError] =
    useState("");

  const projectQuery = useQuery({
    queryKey: [
      "admin-project",
      projectId,
    ],

    queryFn: () =>
      getAdminProjectById(projectId),

    enabled: Boolean(projectId),

    retry: false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-project-categories"],
    queryFn: getAdminProjectCategories,
  });

  const project =
    projectQuery.data?.project;

  useEffect(() => {
    if (project?.title) {
      document.title =
        `${project.title} Düzenle | Bir Parti Yönetim`;
    } else {
      document.title =
        "Proje Düzenle | Bir Parti Yönetim";
    }

    return () => {
      document.title = "Bir Parti";
    };
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: updateAdminProject,

    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-projects"],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "admin-project",
            projectId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "project",
            data.project?.slug,
          ],
        }),
      ]);

      navigate("/admin/projeler", {
        replace: true,
        state: {
          message:
            "Proje başarıyla güncellendi.",
        },
      });
    },

    onError: (error) => {
      setServerError(
        error.message ||
          "Proje güncellenirken bir hata oluştu."
      );
    },
  });

  const handleSubmit = async (formData) => {
    setServerError("");

    await updateMutation.mutateAsync({
      projectId,
      formData,
    });
  };

  const isLoading =
    projectQuery.isLoading ||
    categoriesQuery.isLoading;

  const hasError =
    projectQuery.isError ||
    categoriesQuery.isError;

  if (isLoading) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />
        <p>Proje bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (hasError || !project) {
    return (
      <div className="admin-state">
        <h1>Proje yüklenemedi.</h1>

        <p>
          Proje kaldırılmış veya geçersiz bir
          adres kullanılmış olabilir.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/projeler")
          }
        >
          Projelere Dön
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

          <h1>Projeyi Düzenle</h1>
        </div>

        <span>
          {project.title}
        </span>
      </div>

      <AdminProjectForm
        project={project}
        categories={categories}
        isSaving={updateMutation.isPending}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminProjectEditPage;
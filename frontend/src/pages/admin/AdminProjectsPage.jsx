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
  deleteAdminProject,
  getAdminProjectCategories,
  getAdminProjects,
} from "../../services/adminProjectService";

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşivlendi",
};

const AdminProjectsPage = () => {
    const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] =
    useState("");
  const [status, setStatus] =
    useState("");
  const [category, setCategory] =
    useState("");
const [feedback, setFeedback] = useState(
  location.state?.message || ""
);

useEffect(() => {
  if (!location.state?.message) {
    return;
  }

  setFeedback(location.state.message);

  navigate(location.pathname, {
    replace: true,
    state: {},
  });
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
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const categoriesQuery = useQuery({
    queryKey: [
      "admin-project-categories",
    ],
    queryFn:
      getAdminProjectCategories,
  });

  const projectsQuery = useQuery({
    queryKey: [
      "admin-projects",
      page,
      search,
      status,
      category,
    ],

    queryFn: () =>
      getAdminProjects({
        page,
        search,
        status,
        category,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn:
      deleteAdminProject,

    onSuccess: async () => {
      setFeedback("Proje silindi.");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "admin-projects",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
      ]);
    },

    onError: (error) => {
      setFeedback(
        error.message ||
          "Proje silinemedi."
      );
    },
  });

  const handleDelete = (project) => {
    const confirmed =
      window.confirm(
        `"${project.title}" projesini silmek istediğinize emin misiniz?`
      );

    if (confirmed) {
      deleteMutation.mutate(
        project._id
      );
    }
  };

  const categories =
    categoriesQuery.data
      ?.categories || [];

  const projects =
    projectsQuery.data
      ?.projects || [];

  const pagination =
    projectsQuery.data
      ?.pagination;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>İçerik yönetimi</p>
          <h1>Projeler</h1>
        </div>

        <Link
          to="/admin/projeler/yeni"
          className="admin-primary-button"
        >
          <Plus size={17} />
          Yeni Proje
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
              placeholder="Projelerde ara..."
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

        {projectsQuery.isLoading ? (
          <div className="admin-state">
            <span className="auth-spinner" />
            <p>Projeler yükleniyor...</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Proje</th>
                  <th>Kategori</th>
                  <th>Durum</th>
                  <th>Öne Çıkan</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {projects.map(
                  (project) => (
                    <tr key={project._id}>
                      <td>
                        <strong>
                          {project.title}
                        </strong>

                        <span>
                          /{project.slug}
                        </span>
                      </td>

                      <td>
                        {project.category
                          ?.name || "—"}
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status--${project.status}`}
                        >
                          {
                            statusLabels[
                              project.status
                            ]
                          }
                        </span>
                      </td>

                      <td>
                        {project.isFeatured
                          ? "Evet"
                          : "Hayır"}
                      </td>

                      <td>
                        <div className="admin-inline-actions">
                          <Link
                            to={`/admin/projeler/${project._id}/duzenle`}
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
                                project
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

                {projects.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      Proje bulunamadı.
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
              {pagination.totalProjects}{" "}
              proje
            </span>

            <div>
              <button
                type="button"
                disabled={
                  pagination.page <= 1
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      current - 1,
                      1
                    )
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>

              <strong>
                {pagination.page} /{" "}
                {pagination.totalPages}
              </strong>

              <button
                type="button"
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  setPage((current) =>
                    current + 1
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminProjectsPage;
import {
  Pencil,
  Plus,
  Trash2,
  X,
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
  createAdminForumCategory,
  deleteAdminForumCategory,
  getAdminForumCategories,
  updateAdminForumCategory,
} from "../../services/adminForumService";

const initialFormState = {
  name: "",
  slug: "",
  description: "",
  color: "#2453ad",
  isActive: true,
  sortOrder: 0,
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const AdminForumCategoriesPage = () => {
  const queryClient = useQueryClient();

  const [
    editingCategoryId,
    setEditingCategoryId,
  ] = useState(null);

  const [formData, setFormData] = useState(
    initialFormState
  );

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    document.title =
      "Forum Kategorileri | Bir Parti Yönetim";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  const categoriesQuery = useQuery({
    queryKey: ["admin-forum-categories"],
    queryFn: getAdminForumCategories,
  });

  const refreshCategories = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-forum-categories"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["forum-categories"],
      }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const normalizedData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        color: formData.color,
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (editingCategoryId) {
        return updateAdminForumCategory({
          categoryId: editingCategoryId,
          formData: normalizedData,
        });
      }

      return createAdminForumCategory(
        normalizedData
      );
    },

    onSuccess: async () => {
      setFeedback({
        type: "success",

        message: editingCategoryId
          ? "Forum kategorisi güncellendi."
          : "Forum kategorisi oluşturuldu.",
      });

      setEditingCategoryId(null);
      setFormData(initialFormState);

      await refreshCategories();
    },

    onError: (error) => {
      setFeedback({
        type: "error",

        message: getErrorMessage(
          error,
          "Forum kategorisi kaydedilemedi."
        ),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminForumCategory,

    onSuccess: async () => {
      setFeedback({
        type: "success",
        message: "Forum kategorisi silindi.",
      });

      await refreshCategories();
    },

    onError: (error) => {
      setFeedback({
        type: "error",

        message: getErrorMessage(
          error,
          "Forum kategorisi silinemedi."
        ),
      });
    },
  });

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleEdit = (category) => {
    setEditingCategoryId(category._id);

    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description:
        category.description || "",
      color: category.color || "#2453ad",
      isActive: Boolean(category.isActive),
      sortOrder:
        Number(category.sortOrder) || 0,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.name.trim().length < 2) {
      setFeedback({
        type: "error",
        message:
          "Kategori adı en az 2 karakter olmalıdır.",
      });

      return;
    }

    setFeedback({
      type: "",
      message: "",
    });

    saveMutation.mutate();
  };

  const handleDelete = (category) => {
    const confirmed = window.confirm(
      `"${category.name}" kategorisini silmek istediğinize emin misiniz?`
    );

    if (confirmed) {
      deleteMutation.mutate(category._id);
    }
  };

  const categories =
    categoriesQuery.data?.categories || [];

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Forum yönetimi</p>
          <h1>Forum Kategorileri</h1>
        </div>

        <span>
          Forum konularında kullanılacak
          kategorileri yönetin.
        </span>
      </div>

      {feedback.message && (
        <div
          className={`admin-feedback ${
            feedback.type === "error"
              ? "admin-feedback--error"
              : ""
          }`}
        >
          {feedback.message}

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

      <div className="admin-category-layout">
        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>
                {editingCategoryId
                  ? "Düzenleme"
                  : "Yeni kayıt"}
              </p>

              <h2>
                {editingCategoryId
                  ? "Kategoriyi Düzenle"
                  : "Kategori Ekle"}
              </h2>
            </div>
          </div>

          <form
            className="admin-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-form-field">
              <label htmlFor="forum-category-name">
                Kategori adı
              </label>

              <input
                id="forum-category-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="forum-category-slug">
                Sayfa adresi
              </label>

              <input
                id="forum-category-slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Boş bırakılırsa otomatik oluşturulur"
                maxLength={120}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="forum-category-description">
                Açıklama
              </label>

              <textarea
                id="forum-category-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                maxLength={700}
              />

              <small>
                {formData.description.length}/700
                karakter
              </small>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label htmlFor="forum-category-color">
                  Renk
                </label>

                <input
                  id="forum-category-color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="forum-category-order">
                  Sıralama
                </label>

                <input
                  id="forum-category-order"
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="admin-form-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />

              <span>Kategori aktif olsun</span>
            </label>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={saveMutation.isPending}
              >
                <Plus size={17} />

                {saveMutation.isPending
                  ? "Kaydediliyor..."
                  : editingCategoryId
                    ? "Değişiklikleri Kaydet"
                    : "Kategori Ekle"}
              </button>

              {editingCategoryId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={cancelEditing}
                >
                  <X size={17} />
                  Vazgeç
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Mevcut kayıtlar</p>
              <h2>Kategori Listesi</h2>
            </div>
          </div>

          {categoriesQuery.isLoading ? (
            <div className="admin-state">
              <span className="auth-spinner" />
              <p>Kategoriler yükleniyor...</p>
            </div>
          ) : categoriesQuery.isError ? (
            <div className="admin-state">
              <h2>Kategoriler alınamadı.</h2>

              <button
                type="button"
                onClick={() =>
                  categoriesQuery.refetch()
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
                    <th>Kategori</th>
                    <th>Konu Sayısı</th>
                    <th>Durum</th>
                    <th>Sıra</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <strong>
                          <span
                            className="admin-category-color"
                            style={{
                              backgroundColor:
                                category.color,
                            }}
                          />

                          {category.name}
                        </strong>

                        <span>/{category.slug}</span>
                      </td>

                      <td>
                        {category.topicCount || 0}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            category.isActive
                              ? "admin-status--active"
                              : "admin-status--suspended"
                          }`}
                        >
                          {category.isActive
                            ? "Aktif"
                            : "Pasif"}
                        </span>
                      </td>

                      <td>{category.sortOrder}</td>

                      <td>
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(category)
                            }
                          >
                            <Pencil size={16} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            className="admin-danger-button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            disabled={
                              deleteMutation.isPending
                            }
                          >
                            <Trash2 size={16} />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        Henüz forum kategorisi
                        bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminForumCategoriesPage;
import {
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useEffect,
  useState,
} from "react";

import {
  createAdminBlogCategory,
  deleteAdminBlogCategory,
  getAdminBlogCategories,
  updateAdminBlogCategory,
} from "../../services/adminBlogService";

const initialFormState = {
  name: "",
  slug: "",
  description: "",
  color: "#2453ad",
  isActive: true,
  sortOrder: 0,
};

const AdminBlogCategoriesPage =
  () => {
    const queryClient =
      useQueryClient();

    const [
      editingCategoryId,
      setEditingCategoryId,
    ] = useState(null);

    const [
      formData,
      setFormData,
    ] = useState(
      initialFormState
    );

    const [
      feedback,
      setFeedback,
    ] = useState("");

    useEffect(() => {
      document.title =
        "Blog Kategorileri | Bir Parti";

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

    const refreshCategories =
      async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "admin-blog-categories",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "blog-categories",
            ],
          }),
        ]);
      };

    const saveMutation =
      useMutation({
        mutationFn: async () => {
          const normalizedData = {
            ...formData,

            sortOrder: Number(
              formData.sortOrder
            ),
          };

          if (
            editingCategoryId
          ) {
            return updateAdminBlogCategory(
              {
                categoryId:
                  editingCategoryId,

                formData:
                  normalizedData,
              }
            );
          }

          return createAdminBlogCategory(
            normalizedData
          );
        },

        onSuccess: async () => {
          setFeedback(
            editingCategoryId
              ? "Blog kategorisi güncellendi."
              : "Blog kategorisi oluşturuldu."
          );

          setEditingCategoryId(
            null
          );

          setFormData(
            initialFormState
          );

          await refreshCategories();
        },

        onError: (error) => {
          setFeedback(
            error.message ||
              "Blog kategorisi kaydedilemedi."
          );
        },
      });

    const deleteMutation =
      useMutation({
        mutationFn:
          deleteAdminBlogCategory,

        onSuccess: async () => {
          setFeedback(
            "Blog kategorisi silindi."
          );

          await refreshCategories();
        },

        onError: (error) => {
          setFeedback(
            error.message ||
              "Blog kategorisi silinemedi."
          );
        },
      });

    const handleChange = (
      event
    ) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setFormData(
        (current) => ({
          ...current,

          [name]:
            type === "checkbox"
              ? checked
              : value,
        })
      );
    };

    const handleEdit = (
      category
    ) => {
      setEditingCategoryId(
        category._id
      );

      setFormData({
        name:
          category.name || "",

        slug:
          category.slug || "",

        description:
          category.description || "",

        color:
          category.color ||
          "#2453ad",

        isActive:
          category.isActive,

        sortOrder:
          category.sortOrder || 0,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const cancelEditing = () => {
      setEditingCategoryId(
        null
      );

      setFormData(
        initialFormState
      );
    };

    const handleSubmit = (
      event
    ) => {
      event.preventDefault();

      setFeedback("");

      saveMutation.mutate();
    };

    const handleDelete = (
      category
    ) => {
      const confirmed =
        window.confirm(
          `"${category.name}" kategorisini silmek istediğinize emin misiniz?`
        );

      if (confirmed) {
        deleteMutation.mutate(
          category._id
        );
      }
    };

    const categories =
      categoriesQuery.data
        ?.categories || [];

    return (
      <div className="admin-page">
        <div className="admin-page__heading">
          <div>
            <p>
              Blog yönetimi
            </p>

            <h1>
              Blog Kategorileri
            </h1>
          </div>

          <span>
            Blog yazılarında
            kullanılacak kategorileri
            yönetin.
          </span>
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
              onSubmit={
                handleSubmit
              }
            >
              <div className="admin-form-field">
                <label htmlFor="blog-category-name">
                  Kategori adı
                </label>

                <input
                  id="blog-category-name"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="blog-category-slug">
                  Sayfa adresi
                </label>

                <input
                  id="blog-category-slug"
                  name="slug"
                  value={
                    formData.slug
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Boş bırakılırsa otomatik oluşturulur"
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="blog-category-description">
                  Açıklama
                </label>

                <textarea
                  id="blog-category-description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label htmlFor="blog-category-color">
                    Renk
                  </label>

                  <input
                    id="blog-category-color"
                    name="color"
                    type="color"
                    value={
                      formData.color
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="blog-category-order">
                    Sıralama
                  </label>

                  <input
                    id="blog-category-order"
                    name="sortOrder"
                    type="number"
                    min="0"
                    value={
                      formData.sortOrder
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>
              </div>

              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Kategori aktif
                  olsun
                </span>
              </label>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={
                    saveMutation.isPending
                  }
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
                    onClick={
                      cancelEditing
                    }
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
                <p>
                  Mevcut kayıtlar
                </p>

                <h2>
                  Blog Kategorileri
                </h2>
              </div>
            </div>

            {categoriesQuery.isLoading ? (
              <div className="admin-state">
                <span className="auth-spinner" />

                <p>
                  Kategoriler
                  yükleniyor...
                </p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        Kategori
                      </th>

                      <th>
                        Durum
                      </th>

                      <th>Sıra</th>

                      <th>
                        İşlemler
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map(
                      (category) => (
                        <tr
                          key={
                            category._id
                          }
                        >
                          <td>
                            <strong>
                              <span
                                className="admin-category-color"
                                style={{
                                  backgroundColor:
                                    category.color,
                                }}
                              />

                              {
                                category.name
                              }
                            </strong>

                            <span>
                              /
                              {
                                category.slug
                              }
                            </span>
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

                          <td>
                            {
                              category.sortOrder
                            }
                          </td>

                          <td>
                            <div className="admin-inline-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    category
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    16
                                  }
                                />
                                Düzenle
                              </button>

                              <button
                                type="button"
                                className="admin-danger-button"
                                onClick={() =>
                                  handleDelete(
                                    category
                                  )
                                }
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}

                    {categories.length ===
                      0 && (
                      <tr>
                        <td colSpan="4">
                          Henüz blog
                          kategorisi
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

export default AdminBlogCategoriesPage;
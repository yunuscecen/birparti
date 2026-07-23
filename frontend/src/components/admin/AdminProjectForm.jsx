import {
  ArrowLeft,
  Eye,
  Image,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const createEmptySection = () => ({
  heading: "",
  body: "",
});

const initialFormState = {
  title: "",
  slug: "",
  summary: "",
  category: "",
  coverImage: {
    url: "",
    alt: "",
  },
  sections: [createEmptySection()],
  tagsText: "",
  status: "draft",
  isFeatured: false,
  sortOrder: 0,
  seo: {
    title: "",
    description: "",
  },
};

const normalizeInitialData = (project) => {
  if (!project) {
    return initialFormState;
  }

  const sections =
    project.sections?.length > 0
      ? project.sections.map((section) => ({
          heading: "",
          body: section.body || "",
        }))
      : [createEmptySection()];

  return {
    title: project.title || "",
    slug: project.slug || "",
    summary: project.summary || "",

    category:
      typeof project.category === "string"
        ? project.category
        : project.category?._id || "",

    coverImage: {
      url: project.coverImage?.url || "",
      alt: project.coverImage?.alt || "",
    },

    sections,

    tagsText: Array.isArray(project.tags)
      ? project.tags.join(", ")
      : "",

    status: project.status || "draft",

    isFeatured: Boolean(project.isFeatured),

    sortOrder: Number(project.sortOrder || 0),

    seo: {
      title: project.seo?.title || "",
      description: project.seo?.description || "",
    },
  };
};

const AdminProjectForm = ({
  project = null,
  categories = [],
  isSaving = false,
  serverError = "",
  onSubmit,
}) => {
  const [formData, setFormData] = useState(() =>
    normalizeInitialData(project)
  );

  const [formError, setFormError] = useState("");

  useEffect(() => {
    setFormData(normalizeInitialData(project));
    setFormError("");
  }, [project]);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) => category._id === formData.category
    );
  }, [categories, formData.category]);

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedFieldChange = (
    group,
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,

      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const handleSectionChange = (
    sectionIndex,
    value
  ) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map(
        (section, index) =>
          index === sectionIndex
            ? {
                ...section,
                heading: "",
                body: value,
              }
            : section
      ),
    }));
  };

  const addSection = () => {
    setFormData((current) => ({
      ...current,
      sections: [
        ...current.sections,
        createEmptySection(),
      ],
    }));
  };

  const removeSection = (sectionIndex) => {
    setFormData((current) => {
      if (current.sections.length === 1) {
        return {
          ...current,
          sections: [createEmptySection()],
        };
      }

      return {
        ...current,

        sections: current.sections.filter(
          (_, index) => index !== sectionIndex
        ),
      };
    });
  };

  const validateForm = () => {
    if (formData.title.trim().length < 3) {
      return "Proje başlığı en az 3 karakter olmalıdır.";
    }

    if (formData.summary.trim().length < 10) {
      return "Proje özeti en az 10 karakter olmalıdır.";
    }

    if (!formData.category) {
      return "Bir proje kategorisi seçmelisiniz.";
    }

    const hasContent = formData.sections.some(
      (section) => section.body.trim().length > 0
    );

    if (!hasContent) {
      return "En az bir proje içeriği girmelisiniz.";
    }

    if (
      formData.seo.title &&
      formData.seo.title.length > 70
    ) {
      return "SEO başlığı en fazla 70 karakter olabilir.";
    }

    if (
      formData.seo.description &&
      formData.seo.description.length > 180
    ) {
      return "SEO açıklaması en fazla 180 karakter olabilir.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");

    const tags = formData.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter(
        (tag, index, array) =>
          array.indexOf(tag) === index
      );

    const sections = formData.sections
      .map((section) => ({
        heading: "",
        body: section.body.trim(),
      }))
      .filter((section) => section.body);

    await onSubmit({
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      summary: formData.summary.trim(),
      category: formData.category,

      coverImage: {
        url: formData.coverImage.url.trim(),
        alt:
          formData.coverImage.alt.trim() ||
          formData.title.trim(),
      },

      sections,
      tags,

      status: formData.status,

      isFeatured: formData.isFeatured,

      sortOrder: Number(formData.sortOrder) || 0,

      seo: {
        title: formData.seo.title.trim(),

        description:
          formData.seo.description.trim(),
      },
    });
  };

  return (
    <form
      className="admin-project-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {(formError || serverError) && (
        <div
          className="admin-form-message admin-form-message--error"
          role="alert"
        >
          {formError || serverError}
        </div>
      )}

      <div className="admin-project-form__layout">
        <div className="admin-project-form__main">
          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>Temel bilgiler</p>

                <h2>Proje Bilgileri</h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label htmlFor="project-title">
                  Proje başlığı
                </label>

                <input
                  id="project-title"
                  name="title"
                  value={formData.title}
                  onChange={handleFieldChange}
                  placeholder="Örnek: Eğitim Reformu"
                  maxLength={180}
                  required
                />

                <small>
                  {formData.title.length}/180 karakter
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="project-slug">
                  Sayfa adresi
                </label>

                <input
                  id="project-slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleFieldChange}
                  placeholder="Boş bırakılırsa başlıktan otomatik oluşturulur"
                  maxLength={200}
                />

                <small>
                  Örnek: egitim-reformu
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="project-summary">
                  Proje özeti
                </label>

                <textarea
                  id="project-summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleFieldChange}
                  placeholder="Proje kartında ve detay sayfasının üst bölümünde gösterilecek kısa açıklama."
                  rows={5}
                  maxLength={600}
                  required
                />

                <small>
                  {formData.summary.length}/600 karakter
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="project-category">
                  Proje kategorisi
                </label>

                <select
                  id="project-category"
                  name="category"
                  value={formData.category}
                  onChange={handleFieldChange}
                  required
                >
                  <option value="">
                    Kategori seçin
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                      {!category.isActive
                        ? " — Pasif"
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedCategory && (
                  <div className="admin-selected-category">
                    <span
                      style={{
                        backgroundColor:
                          selectedCategory.color,
                      }}
                    />

                    {selectedCategory.name}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading admin-panel-card__heading--actions">
              <div>
                <p>Detay içeriği</p>

                <h2>Proje Metinleri</h2>
              </div>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={addSection}
              >
                <Plus size={16} />
                Metin Alanı Ekle
              </button>
            </div>

            <div className="admin-project-sections">
              {formData.sections.map(
                (section, index) => (
                  <div
                    className="admin-project-section"
                    key={`project-section-${index}`}
                  >
                    <div className="admin-project-section__heading">
                      <strong>
                        İçerik Bölümü {index + 1}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          removeSection(index)
                        }
                        aria-label={`${index + 1}. içerik bölümünü kaldır`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <textarea
                      value={section.body}
                      onChange={(event) =>
                        handleSectionChange(
                          index,
                          event.target.value
                        )
                      }
                      placeholder="Projenin ayrıntılı açıklamasını yazın..."
                      rows={8}
                      maxLength={10000}
                    />

                    <small>
                      {section.body.length}/10000
                      karakter
                    </small>
                  </div>
                )
              )}

              <button
                type="button"
                className="admin-add-section-button"
                onClick={addSection}
              >
                <Plus size={18} />
                Yeni Metin Alanı Ekle
              </button>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>Medya</p>

                <h2>Kapak Görseli</h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label htmlFor="project-image-url">
                  Görsel adresi
                </label>

                <div className="admin-form-input-with-icon">
                  <Image size={18} />

                  <input
                    id="project-image-url"
                    type="url"
                    value={formData.coverImage.url}
                    onChange={(event) =>
                      handleNestedFieldChange(
                        "coverImage",
                        "url",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label htmlFor="project-image-alt">
                  Görsel açıklaması
                </label>

                <input
                  id="project-image-alt"
                  value={formData.coverImage.alt}
                  onChange={(event) =>
                    handleNestedFieldChange(
                      "coverImage",
                      "alt",
                      event.target.value
                    )
                  }
                  placeholder="Görsel erişilebilirlik açıklaması"
                  maxLength={180}
                />
              </div>

              {formData.coverImage.url && (
                <div className="admin-image-preview">
                  <img
                    src={formData.coverImage.url}
                    alt={
                      formData.coverImage.alt ||
                      "Proje kapak görseli önizlemesi"
                    }
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div>
                    <Eye size={18} />
                    Kapak görseli önizlemesi
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>Arama motoru görünümü</p>

                <h2>SEO Ayarları</h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label htmlFor="project-seo-title">
                  SEO başlığı
                </label>

                <input
                  id="project-seo-title"
                  value={formData.seo.title}
                  onChange={(event) =>
                    handleNestedFieldChange(
                      "seo",
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Boş bırakılırsa proje başlığı kullanılır"
                  maxLength={70}
                />

                <small>
                  {formData.seo.title.length}/70
                  karakter
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="project-seo-description">
                  SEO açıklaması
                </label>

                <textarea
                  id="project-seo-description"
                  value={formData.seo.description}
                  onChange={(event) =>
                    handleNestedFieldChange(
                      "seo",
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Arama motorlarında gösterilecek kısa açıklama."
                  rows={4}
                  maxLength={180}
                />

                <small>
                  {
                    formData.seo.description
                      .length
                  }
                  /180 karakter
                </small>
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-project-form__sidebar">
          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>Yayın ayarları</p>

                <h2>Proje Durumu</h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label htmlFor="project-status">
                  Yayın durumu
                </label>

                <select
                  id="project-status"
                  name="status"
                  value={formData.status}
                  onChange={handleFieldChange}
                >
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

              <div className="admin-form-field">
                <label htmlFor="project-sort-order">
                  Sıralama
                </label>

                <input
                  id="project-sort-order"
                  name="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={handleFieldChange}
                />
              </div>

              <label className="admin-form-checkbox admin-form-checkbox--boxed">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleFieldChange}
                />

                <span>
                  <strong>Öne çıkan proje</strong>

                  <small>
                    Proje listesinde öncelikli
                    gösterilir.
                  </small>
                </span>
              </label>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>Sınıflandırma</p>

                <h2>Etiketler</h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label htmlFor="project-tags">
                  Proje etiketleri
                </label>

                <textarea
                  id="project-tags"
                  name="tagsText"
                  value={formData.tagsText}
                  onChange={handleFieldChange}
                  placeholder="eğitim, gelecek, reform"
                  rows={5}
                />

                <small>
                  Etiketleri virgülle ayırın.
                </small>
              </div>
            </div>
          </section>

          <div className="admin-project-form__sticky-actions">
            <button
              type="submit"
              className="admin-primary-button admin-project-save-button"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="auth-spinner auth-spinner--small" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={18} />

                  {project
                    ? "Değişiklikleri Kaydet"
                    : "Projeyi Oluştur"}
                </>
              )}
            </button>

            <Link
              to="/admin/projeler"
              className="admin-secondary-button"
            >
              <ArrowLeft size={17} />
              Projelere Dön
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default AdminProjectForm;
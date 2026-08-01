import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";
import ImageUploadField from "./ImageUploadField";
const createEmptySection = () => ({
  heading: "",
  body: "",
});

const initialFormState = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",

coverImage: {
  url: "",
  publicId: "",
  alt: "",
},

  sections: [
    createEmptySection(),
  ],

  tagsText: "",
  status: "draft",
  isFeatured: false,

  seo: {
    title: "",
    description: "",
  },
};

const normalizePost = (post) => {
  if (!post) {
    return initialFormState;
  }

  return {
    title:
      post.title || "",

    slug:
      post.slug || "",

    excerpt:
      post.excerpt || "",

    category:
      typeof post.category ===
      "string"
        ? post.category
        : post.category?._id || "",

   coverImage: {
  url:
    post.coverImage?.url ||
    "",

  publicId:
    post.coverImage
      ?.publicId || "",

  alt:
    post.coverImage?.alt ||
    "",
},
    sections:
      post.sections?.length > 0
        ? post.sections.map(
            (section) => ({
              heading:
                section.heading || "",

              body:
                section.body || "",
            })
          )
        : [
            createEmptySection(),
          ],

    tagsText:
      Array.isArray(post.tags)
        ? post.tags.join(", ")
        : "",

    status:
      post.status || "draft",

    isFeatured:
      Boolean(
        post.isFeatured
      ),

    seo: {
      title:
        post.seo?.title || "",

      description:
        post.seo?.description || "",
    },
  };
};

const AdminBlogPostForm = ({
  post = null,
  categories = [],
  isSaving = false,
  serverError = "",
  onSubmit,
}) => {
  const [
    formData,
    setFormData,
  ] = useState(() =>
    normalizePost(post)
  );

  const [
    formError,
    setFormError,
  ] = useState("");
  
const [
  isCoverImageUploading,
  setIsCoverImageUploading,
] = useState(false);


  useEffect(() => {
    setFormData(
      normalizePost(post)
    );

    setFormError("");
  }, [post]);

  const handleFieldChange = (
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

  const updateNestedField = (
    section,
    field,
    value
  ) => {
    setFormData(
      (current) => ({
        ...current,

        [section]: {
          ...current[section],
          [field]: value,
        },
      })
    );
  };

  const handleCoverImageChange =
  (
    url,
    publicId = ""
  ) => {
    setFormData(
      (current) => ({
        ...current,

        coverImage: {
          ...current.coverImage,
          url,
          publicId,
        },
      })
    );
  };

  const updateContentSection = (
    sectionIndex,
    field,
    value
  ) => {
    setFormData(
      (current) => ({
        ...current,

        sections:
          current.sections.map(
            (
              section,
              index
            ) =>
              index ===
              sectionIndex
                ? {
                    ...section,
                    [field]: value,
                  }
                : section
          ),
      })
    );
  };

  const addContentSection =
    () => {
      setFormData(
        (current) => ({
          ...current,

          sections: [
            ...current.sections,
            createEmptySection(),
          ],
        })
      );
    };

  const removeContentSection = (
    sectionIndex
  ) => {
    setFormData(
      (current) => {
        if (
          current.sections
            .length === 1
        ) {
          return {
            ...current,
            sections: [
              createEmptySection(),
            ],
          };
        }

        return {
          ...current,

          sections:
            current.sections.filter(
              (_, index) =>
                index !==
                sectionIndex
            ),
        };
      }
    );
  };

  const validateForm = () => {
    if (
  isCoverImageUploading
) {
  return "Kapak görselinin yüklenmesi tamamlanana kadar bekleyin.";
}
    if (
      formData.title.trim()
        .length < 3
    ) {
      return "Blog başlığı en az 3 karakter olmalıdır.";
    }

    if (
      formData.excerpt.trim()
        .length < 10
    ) {
      return "Blog özeti en az 10 karakter olmalıdır.";
    }

    if (!formData.category) {
      return "Bir blog kategorisi seçmelisiniz.";
    }

    const hasContent =
      formData.sections.some(
        (section) =>
          section.body.trim()
      );

    if (!hasContent) {
      return "En az bir blog içerik alanı doldurulmalıdır.";
    }

    return "";
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(
        validationError
      );

      return;
    }

    setFormError("");

    const tags =
      formData.tagsText
        .split(",")
        .map((tag) =>
          tag.trim()
        )
        .filter(Boolean)
        .filter(
          (
            tag,
            index,
            values
          ) =>
            values.indexOf(tag) ===
            index
        );

    const sections =
      formData.sections
        .map(
          (
            section,
            index
          ) => ({
            heading:
              section.heading.trim(),

            body:
              section.body.trim(),

            sortOrder:
              index,
          })
        )
        .filter(
          (section) =>
            section.body
        );

    await onSubmit({
      title:
        formData.title.trim(),

      slug:
        formData.slug.trim(),

      excerpt:
        formData.excerpt.trim(),

      category:
        formData.category,

      coverImage: {
  url:
    formData.coverImage
      .url.trim(),

  publicId:
    formData.coverImage
      .publicId.trim(),

  alt:
    formData.coverImage
      .alt.trim() ||
    formData.title.trim(),
},

      sections,
      tags,

      status:
        formData.status,

      isFeatured:
        formData.isFeatured,

      seo: {
        title:
          formData.seo.title.trim(),

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
      {(formError ||
        serverError) && (
        <div className="admin-form-message admin-form-message--error">
          {formError ||
            serverError}
        </div>
      )}

      <div className="admin-project-form__layout">
        <div className="admin-project-form__main">
          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>
                  Temel bilgiler
                </p>

                <h2>
                  Blog Yazısı
                </h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label htmlFor="blog-title">
                  Yazı başlığı
                </label>

                <input
                  id="blog-title"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleFieldChange
                  }
                  maxLength={200}
                  required
                />

                <small>
                  {
                    formData.title
                      .length
                  }
                  /200 karakter
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="blog-slug">
                  Sayfa adresi
                </label>

                <input
                  id="blog-slug"
                  name="slug"
                  value={
                    formData.slug
                  }
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Boş bırakılırsa başlıktan otomatik oluşturulur"
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="blog-excerpt">
                  Yazı özeti
                </label>

                <textarea
                  id="blog-excerpt"
                  name="excerpt"
                  value={
                    formData.excerpt
                  }
                  onChange={
                    handleFieldChange
                  }
                  rows={5}
                  maxLength={700}
                />

                <small>
                  {
                    formData.excerpt
                      .length
                  }
                  /700 karakter
                </small>
              </div>

              <div className="admin-form-field">
                <label htmlFor="blog-category">
                  Blog kategorisi
                </label>

                <select
                  id="blog-category"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleFieldChange
                  }
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
                        {
                          category.name
                        }

                        {!category.isActive
                          ? " — Pasif"
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading admin-panel-card__heading--actions">
              <div>
                <p>
                  Yazı içeriği
                </p>

                <h2>
                  İçerik Bölümleri
                </h2>
              </div>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  addContentSection
                }
              >
                <Plus size={16} />
                İçerik Ekle
              </button>
            </div>

            <div className="admin-project-sections">
              {formData.sections.map(
                (
                  section,
                  sectionIndex
                ) => (
                  <article
                    className="admin-project-section"
                    key={`blog-section-${sectionIndex}`}
                  >
                    <div className="admin-project-section__heading">
                      <strong>
                        İçerik Bölümü{" "}
                        {sectionIndex +
                          1}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          removeContentSection(
                            sectionIndex
                          )
                        }
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>

                    <div className="admin-form-field">
                      <label>
                        Ara başlık
                      </label>

                      <input
                        value={
                          section.heading
                        }
                        onChange={(
                          event
                        ) =>
                          updateContentSection(
                            sectionIndex,
                            "heading",
                            event.target
                              .value
                          )
                        }
                        placeholder="İsteğe bağlı"
                        maxLength={200}
                      />
                    </div>

                    <div className="admin-form-field">
                      <label>
                        İçerik
                      </label>

                      <textarea
                        value={
                          section.body
                        }
                        onChange={(
                          event
                        ) =>
                          updateContentSection(
                            sectionIndex,
                            "body",
                            event.target
                              .value
                          )
                        }
                        rows={10}
                        maxLength={
                          20000
                        }
                        placeholder="Blog yazısının metnini girin..."
                      />

                      <small>
                        {
                          section.body
                            .length
                        }
                        /20000 karakter
                      </small>
                    </div>
                  </article>
                )
              )}

              <button
                type="button"
                className="admin-add-section-button"
                onClick={
                  addContentSection
                }
              >
                <Plus size={18} />
                Yeni İçerik Alanı
                Ekle
              </button>
            </div>
          </section>

       <section className="admin-panel-card">
  <div className="admin-panel-card__heading">
    <div>
      <p>Medya</p>

      <h2>
        Kapak Görseli
      </h2>
    </div>
  </div>

  <ImageUploadField
    id="blog-cover-image"
    label="Blog kapak görseli"
    folderKey="blog-cover"
    altMaxLength={200}
    value={
      formData.coverImage.url
    }
    altValue={
      formData.coverImage.alt
    }
    disabled={isSaving}
    onUploadingChange={
      setIsCoverImageUploading
    }
    onChange={
      handleCoverImageChange
    }
    onAltChange={(alt) =>
      updateNestedField(
        "coverImage",
        "alt",
        alt
      )
    }
  />
</section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>
                  Arama motorları
                </p>

                <h2>
                  SEO Ayarları
                </h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label>
                  SEO başlığı
                </label>

                <input
                  value={
                    formData.seo.title
                  }
                  onChange={(
                    event
                  ) =>
                    updateNestedField(
                      "seo",
                      "title",
                      event.target
                        .value
                    )
                  }
                  maxLength={70}
                />

                <small>
                  {
                    formData.seo
                      .title.length
                  }
                  /70 karakter
                </small>
              </div>

              <div className="admin-form-field">
                <label>
                  SEO açıklaması
                </label>

                <textarea
                  value={
                    formData.seo
                      .description
                  }
                  onChange={(
                    event
                  ) =>
                    updateNestedField(
                      "seo",
                      "description",
                      event.target
                        .value
                    )
                  }
                  rows={4}
                  maxLength={180}
                />

                <small>
                  {
                    formData.seo
                      .description
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
                <p>Yayın</p>
                <h2>
                  Yazı Durumu
                </h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label>
                  Yayın durumu
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleFieldChange
                  }
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

              <label className="admin-form-checkbox admin-form-checkbox--boxed">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={
                    formData.isFeatured
                  }
                  onChange={
                    handleFieldChange
                  }
                />

                <span>
                  <strong>
                    Öne çıkan yazı
                  </strong>

                  <small>
                    Blog listesinde
                    öncelikli gösterilir.
                  </small>
                </span>
              </label>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__heading">
              <div>
                <p>
                  Sınıflandırma
                </p>

                <h2>Etiketler</h2>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-field">
                <label>
                  Blog etiketleri
                </label>

                <textarea
                  name="tagsText"
                  value={
                    formData.tagsText
                  }
                  onChange={
                    handleFieldChange
                  }
                  rows={5}
                  placeholder="demokrasi, ekonomi, toplum"
                />

                <small>
                  Etiketleri virgülle
                  ayırın.
                </small>
              </div>
            </div>
          </section>

          <div className="admin-project-form__sticky-actions">
            <button
              type="submit"
              className="admin-primary-button admin-project-save-button"
             disabled={
  isSaving ||
  isCoverImageUploading
}
            >
             {isSaving ||
isCoverImageUploading ? (
  <>
    <span className="auth-spinner auth-spinner--small" />

    {isCoverImageUploading
      ? "Görsel Yükleniyor..."
      : "Kaydediliyor..."}
  </>
) : (
  <>
    <Save size={18} />

    {post
      ? "Değişiklikleri Kaydet"
      : "Blog Yazısını Oluştur"}
  </>
)}
            </button>

            <Link
              to="/admin/blog"
              className="admin-secondary-button"
            >
              <ArrowLeft
                size={17}
              />
              Blog Yazılarına Dön
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default AdminBlogPostForm;
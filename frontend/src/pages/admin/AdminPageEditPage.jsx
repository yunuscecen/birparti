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
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getAdminPageBySlug,
  updateAdminPage,
} from "../../services/adminPageService";

const createTextSection = () => ({
  type: "text",
  title: "",
  paragraphs: [""],
  cards: [],
  sortOrder: 0,
});

const createCardsSection = () => ({
  type: "cards",
  title: "",
  paragraphs: [],
  cards: [
    {
      title: "",
      description: "",
      linkLabel: "",
      linkUrl: "",
      sortOrder: 0,
    },
  ],
  sortOrder: 0,
});

const createEmptyCard = () => ({
  title: "",
  description: "",
  linkLabel: "",
  linkUrl: "",
  sortOrder: 0,
});

const initialFormState = {
  eyebrow: "",
  title: "",
  description: "",
  status: "draft",
  sections: [],
  seo: {
    title: "",
    description: "",
  },
};

const normalizePage = (page) => ({
  eyebrow: page?.eyebrow || "",
  title: page?.title || "",
  description: page?.description || "",
  status: page?.status || "draft",

  sections: (page?.sections || []).map(
    (section, sectionIndex) => ({
      type: section.type,
      title: section.title || "",

      paragraphs:
        section.type === "text" &&
        section.paragraphs?.length
          ? [...section.paragraphs]
          : section.type === "text"
            ? [""]
            : [],

      cards:
        section.type === "cards"
          ? (section.cards || []).map(
              (card, cardIndex) => ({
                title: card.title || "",
                description:
                  card.description || "",
                linkLabel:
                  card.linkLabel || "",
                linkUrl: card.linkUrl || "",
                sortOrder: cardIndex,
              })
            )
          : [],

      sortOrder: sectionIndex,
    })
  ),

  seo: {
    title: page?.seo?.title || "",
    description:
      page?.seo?.description || "",
  },
});

const AdminPageEditPage = () => {
  const { slug } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] =
    useState(initialFormState);

  const [formError, setFormError] =
    useState("");

  const pageQuery = useQuery({
    queryKey: ["admin-page", slug],
    queryFn: () =>
      getAdminPageBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const page = pageQuery.data?.page;

  useEffect(() => {
    if (!page) {
      return;
    }

    setFormData(normalizePage(page));

    document.title =
      `${page.title} Düzenle | Bir Parti Yönetim`;

    return () => {
      document.title = "Bir Parti";
    };
  }, [page]);

  const updateMutation = useMutation({
    mutationFn: updateAdminPage,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-pages"],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "admin-page",
            slug,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "page-content",
            slug,
          ],
        }),
      ]);

      navigate("/admin/sayfalar", {
        replace: true,
      });
    },

    onError: (error) => {
      setFormError(
        error.message ||
          "Sayfa güncellenirken bir hata oluştu."
      );
    },
  });

  const handleMainFieldChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSeoChange = (
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,

      seo: {
        ...current.seo,
        [field]: value,
      },
    }));
  };

  const updateSection = (
    sectionIndex,
    updates
  ) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map(
        (section, index) =>
          index === sectionIndex
            ? {
                ...section,
                ...updates,
              }
            : section
      ),
    }));
  };

  const changeSectionType = (
    sectionIndex,
    type
  ) => {
    updateSection(sectionIndex, {
      type,

      paragraphs:
        type === "text" ? [""] : [],

      cards:
        type === "cards"
          ? [createEmptyCard()]
          : [],
    });
  };

  const addSection = (type) => {
    setFormData((current) => ({
      ...current,

      sections: [
        ...current.sections,

        type === "cards"
          ? createCardsSection()
          : createTextSection(),
      ],
    }));
  };

  const removeSection = (
    sectionIndex
  ) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.filter(
        (_, index) =>
          index !== sectionIndex
      ),
    }));
  };

  const updateParagraph = (
    sectionIndex,
    paragraphIndex,
    value
  ) => {
    const section =
      formData.sections[sectionIndex];

    const paragraphs =
      section.paragraphs.map(
        (paragraph, index) =>
          index === paragraphIndex
            ? value
            : paragraph
      );

    updateSection(sectionIndex, {
      paragraphs,
    });
  };

  const addParagraph = (
    sectionIndex
  ) => {
    const section =
      formData.sections[sectionIndex];

    updateSection(sectionIndex, {
      paragraphs: [
        ...section.paragraphs,
        "",
      ],
    });
  };

  const removeParagraph = (
    sectionIndex,
    paragraphIndex
  ) => {
    const section =
      formData.sections[sectionIndex];

    const paragraphs =
      section.paragraphs.filter(
        (_, index) =>
          index !== paragraphIndex
      );

    updateSection(sectionIndex, {
      paragraphs:
        paragraphs.length > 0
          ? paragraphs
          : [""],
    });
  };

  const updateCard = (
    sectionIndex,
    cardIndex,
    field,
    value
  ) => {
    const section =
      formData.sections[sectionIndex];

    const cards = section.cards.map(
      (card, index) =>
        index === cardIndex
          ? {
              ...card,
              [field]: value,
            }
          : card
    );

    updateSection(sectionIndex, {
      cards,
    });
  };

  const addCard = (sectionIndex) => {
    const section =
      formData.sections[sectionIndex];

    updateSection(sectionIndex, {
      cards: [
        ...section.cards,
        createEmptyCard(),
      ],
    });
  };

  const removeCard = (
    sectionIndex,
    cardIndex
  ) => {
    const section =
      formData.sections[sectionIndex];

    const cards = section.cards.filter(
      (_, index) => index !== cardIndex
    );

    updateSection(sectionIndex, {
      cards:
        cards.length > 0
          ? cards
          : [createEmptyCard()],
    });
  };

  const validateForm = () => {
    if (formData.title.trim().length < 2) {
      return "Sayfa başlığı en az 2 karakter olmalıdır.";
    }

    for (
      let index = 0;
      index < formData.sections.length;
      index += 1
    ) {
      const section =
        formData.sections[index];

      if (
        section.type === "text" &&
        !section.paragraphs.some(
          (paragraph) =>
            paragraph.trim()
        )
      ) {
        return `${index + 1}. metin bölümünde en az bir paragraf bulunmalıdır.`;
      }

      if (
        section.type === "cards" &&
        !section.cards.some(
          (card) => card.title.trim()
        )
      ) {
        return `${index + 1}. kart bölümünde en az bir kart bulunmalıdır.`;
      }
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
      setFormError(validationError);
      return;
    }

    setFormError("");

    const normalizedSections =
      formData.sections.map(
        (section, sectionIndex) => ({
          type: section.type,
          title: section.title.trim(),

          paragraphs:
            section.type === "text"
              ? section.paragraphs
                  .map((paragraph) =>
                    paragraph.trim()
                  )
                  .filter(Boolean)
              : [],

          cards:
            section.type === "cards"
              ? section.cards
                  .filter((card) =>
                    card.title.trim()
                  )
                  .map(
                    (
                      card,
                      cardIndex
                    ) => ({
                      title:
                        card.title.trim(),

                      description:
                        card.description.trim(),

                      linkLabel:
                        card.linkLabel.trim(),

                      linkUrl:
                        card.linkUrl.trim(),

                      sortOrder:
                        cardIndex,
                    })
                  )
              : [],

          sortOrder: sectionIndex,
        })
      );

    await updateMutation.mutateAsync({
      slug,

      formData: {
        eyebrow:
          formData.eyebrow.trim(),

        title: formData.title.trim(),

        description:
          formData.description.trim(),

        status: formData.status,

        sections: normalizedSections,

        seo: {
          title:
            formData.seo.title.trim(),

          description:
            formData.seo.description.trim(),
        },
      },
    });
  };

  if (pageQuery.isLoading) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />
        <p>Sayfa içeriği yükleniyor...</p>
      </div>
    );
  }

  if (
    pageQuery.isError ||
    !page
  ) {
    return (
      <div className="admin-state">
        <h1>Sayfa bulunamadı.</h1>

        <p>
          Sayfa seed işleminin
          çalıştırıldığından emin olun.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/sayfalar")
          }
        >
          Sayfalara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Sayfa yönetimi</p>
          <h1>{page.title}</h1>
        </div>

        <span>/{page.slug}</span>
      </div>

      <form
        className="admin-page-editor"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && (
          <div className="admin-form-message admin-form-message--error">
            {formError}
          </div>
        )}

        <div className="admin-page-editor__layout">
          <div className="admin-page-editor__main">
            <section className="admin-panel-card">
              <div className="admin-panel-card__heading">
                <div>
                  <p>Üst bölüm</p>
                  <h2>Sayfa Başlığı</h2>
                </div>
              </div>

              <div className="admin-form">
                <div className="admin-form-field">
                  <label htmlFor="page-eyebrow">
                    Küçük üst başlık
                  </label>

                  <input
                    id="page-eyebrow"
                    name="eyebrow"
                    value={formData.eyebrow}
                    onChange={
                      handleMainFieldChange
                    }
                    maxLength={100}
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="page-title">
                    Sayfa başlığı
                  </label>

                  <input
                    id="page-title"
                    name="title"
                    value={formData.title}
                    onChange={
                      handleMainFieldChange
                    }
                    maxLength={180}
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="page-description">
                    Üst açıklama
                  </label>

                  <textarea
                    id="page-description"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleMainFieldChange
                    }
                    rows={5}
                    maxLength={1200}
                  />

                  <small>
                    {
                      formData.description
                        .length
                    }
                    /1200 karakter
                  </small>
                </div>
              </div>
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__heading admin-panel-card__heading--actions">
                <div>
                  <p>Sayfa içeriği</p>
                  <h2>İçerik Bölümleri</h2>
                </div>

                <div className="admin-page-editor__add-actions">
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      addSection("text")
                    }
                  >
                    <Plus size={16} />
                    Metin Ekle
                  </button>

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      addSection("cards")
                    }
                  >
                    <Plus size={16} />
                    Kart Alanı Ekle
                  </button>
                </div>
              </div>

              <div className="admin-page-sections">
                {formData.sections.map(
                  (
                    section,
                    sectionIndex
                  ) => (
                    <article
                      className="admin-page-section"
                      key={`section-${sectionIndex}`}
                    >
                      <div className="admin-page-section__header">
                        <strong>
                          Bölüm{" "}
                          {sectionIndex + 1}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removeSection(
                              sectionIndex
                            )
                          }
                          aria-label="Bölümü kaldır"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-field">
                          <label>
                            Bölüm türü
                          </label>

                          <select
                            value={
                              section.type
                            }
                            onChange={(
                              event
                            ) =>
                              changeSectionType(
                                sectionIndex,
                                event.target
                                  .value
                              )
                            }
                          >
                            <option value="text">
                              Metin
                            </option>

                            <option value="cards">
                              Kartlar
                            </option>
                          </select>
                        </div>

                        <div className="admin-form-field">
                          <label>
                            Bölüm başlığı
                          </label>

                          <input
                            value={
                              section.title
                            }
                            onChange={(
                              event
                            ) =>
                              updateSection(
                                sectionIndex,
                                {
                                  title:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            maxLength={180}
                          />
                        </div>
                      </div>

                      {section.type ===
                        "text" && (
                        <div className="admin-page-paragraphs">
                          {section.paragraphs.map(
                            (
                              paragraph,
                              paragraphIndex
                            ) => (
                              <div
                                className="admin-page-paragraph"
                                key={`paragraph-${sectionIndex}-${paragraphIndex}`}
                              >
                                <div className="admin-page-paragraph__heading">
                                  <span>
                                    Paragraf{" "}
                                    {paragraphIndex +
                                      1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeParagraph(
                                        sectionIndex,
                                        paragraphIndex
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={15}
                                    />
                                  </button>
                                </div>

                                <textarea
                                  value={
                                    paragraph
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateParagraph(
                                      sectionIndex,
                                      paragraphIndex,
                                      event.target
                                        .value
                                    )
                                  }
                                  rows={6}
                                  maxLength={5000}
                                />
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            className="admin-add-section-button"
                            onClick={() =>
                              addParagraph(
                                sectionIndex
                              )
                            }
                          >
                            <Plus size={17} />
                            Paragraf Ekle
                          </button>
                        </div>
                      )}

                      {section.type ===
                        "cards" && (
                        <div className="admin-page-cards">
                          {section.cards.map(
                            (
                              card,
                              cardIndex
                            ) => (
                              <div
                                className="admin-page-card-editor"
                                key={`card-${sectionIndex}-${cardIndex}`}
                              >
                                <div className="admin-page-paragraph__heading">
                                  <span>
                                    Kart{" "}
                                    {cardIndex +
                                      1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeCard(
                                        sectionIndex,
                                        cardIndex
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={15}
                                    />
                                  </button>
                                </div>

                                <div className="admin-form-field">
                                  <label>
                                    Kart başlığı
                                  </label>

                                  <input
                                    value={
                                      card.title
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateCard(
                                        sectionIndex,
                                        cardIndex,
                                        "title",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    maxLength={
                                      160
                                    }
                                  />
                                </div>

                                <div className="admin-form-field">
                                  <label>
                                    Kart açıklaması
                                  </label>

                                  <textarea
                                    value={
                                      card.description
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateCard(
                                        sectionIndex,
                                        cardIndex,
                                        "description",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    rows={5}
                                    maxLength={
                                      1200
                                    }
                                  />
                                </div>

                                <div className="admin-form-row">
                                  <div className="admin-form-field">
                                    <label>
                                      Buton yazısı
                                    </label>

                                    <input
                                      value={
                                        card.linkLabel
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateCard(
                                          sectionIndex,
                                          cardIndex,
                                          "linkLabel",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      maxLength={
                                        60
                                      }
                                    />
                                  </div>

                                  <div className="admin-form-field">
                                    <label>
                                      Buton adresi
                                    </label>

                                    <input
                                      value={
                                        card.linkUrl
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateCard(
                                          sectionIndex,
                                          cardIndex,
                                          "linkUrl",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      placeholder="/projelerimiz"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            className="admin-add-section-button"
                            onClick={() =>
                              addCard(
                                sectionIndex
                              )
                            }
                          >
                            <Plus size={17} />
                            Kart Ekle
                          </button>
                        </div>
                      )}
                    </article>
                  )
                )}

                {formData.sections
                  .length === 0 && (
                  <div className="admin-empty-warning">
                    <h2>
                      Henüz içerik bölümü
                      bulunmuyor.
                    </h2>

                    <p>
                      Metin veya kart alanı
                      ekleyerek sayfayı
                      hazırlayın.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__heading">
                <div>
                  <p>Arama motorları</p>
                  <h2>SEO Ayarları</h2>
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
                    onChange={(event) =>
                      handleSeoChange(
                        "title",
                        event.target.value
                      )
                    }
                    maxLength={70}
                  />

                  <small>
                    {
                      formData.seo.title
                        .length
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
                    onChange={(event) =>
                      handleSeoChange(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    maxLength={180}
                  />

                  <small>
                    {
                      formData.seo
                        .description.length
                    }
                    /180 karakter
                  </small>
                </div>
              </div>
            </section>
          </div>

          <aside className="admin-page-editor__sidebar">
            <section className="admin-panel-card">
              <div className="admin-panel-card__heading">
                <div>
                  <p>Yayın</p>
                  <h2>Sayfa Durumu</h2>
                </div>
              </div>

              <div className="admin-form">
                <div className="admin-form-field">
                  <label htmlFor="page-status">
                    Yayın durumu
                  </label>

                  <select
                    id="page-status"
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleMainFieldChange
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
              </div>
            </section>

            <div className="admin-project-form__sticky-actions">
              <button
                type="submit"
                className="admin-primary-button admin-project-save-button"
                disabled={
                  updateMutation.isPending
                }
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="auth-spinner auth-spinner--small" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>

              <Link
                to="/admin/sayfalar"
                className="admin-secondary-button"
              >
                <ArrowLeft size={17} />
                Sayfalara Dön
              </Link>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default AdminPageEditPage;
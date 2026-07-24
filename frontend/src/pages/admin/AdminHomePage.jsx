import {
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

import { homeContent } from "../../data/defaultContent";

import {
  getAdminHomePage,
  updateAdminHomePage,
} from "../../services/adminHomePageService";

const createFeatureCard = () => ({
  title: "",
  description: "",
  buttonLabel: "Detayları Gör",
  path: "/projelerimiz",
  sortOrder: 0,
});

const normalizeContent = (
  content
) => {
  const source =
    content || homeContent;

  return {
    hero: {
      eyebrow:
        source.hero?.eyebrow ||
        "Yeni bir siyaset anlayışı",

      titleFirst:
        source.hero?.titleFirst || "",

      titleSecond:
        source.hero?.titleSecond || "",

      description:
        source.hero?.description || "",

      primaryButton: {
        label:
          source.hero?.primaryButton
            ?.label || "",

        path:
          source.hero?.primaryButton
            ?.path || "/projelerimiz",
      },

      secondaryButton: {
        label:
          source.hero?.secondaryButton
            ?.label || "",

        path:
          source.hero?.secondaryButton
            ?.path || "/biz-kimiz",
      },
    },

    featureCards:
      source.featureCards?.length > 0
        ? source.featureCards.map(
            (card, index) => ({
              title: card.title || "",

              description:
                card.description || "",

              buttonLabel:
                card.buttonLabel ||
                "Detayları Gör",

              path:
                card.path ||
                "/projelerimiz",

              sortOrder: index,
            })
          )
        : [createFeatureCard()],

    manifesto: {
      eyebrow:
        source.manifesto?.eyebrow ||
        "Birlikte mümkün",

      title:
        source.manifesto?.title || "",

      description:
        source.manifesto
          ?.description || "",

      primaryButton: {
        label:
          source.manifesto
            ?.primaryButton?.label || "",

        path:
          source.manifesto
            ?.primaryButton?.path ||
          "/kayit",
      },

      secondaryButton: {
        label:
          source.manifesto
            ?.secondaryButton?.label || "",

        path:
          source.manifesto
            ?.secondaryButton?.path ||
          "/iletisim",
      },
    },

    seo: {
      title:
        source.seo?.title ||
        "Bir Parti",

      description:
        source.seo?.description ||
        source.hero?.description ||
        "",
    },
  };
};

const AdminHomePage = () => {
  const queryClient =
    useQueryClient();

  const [formData, setFormData] =
    useState(() =>
      normalizeContent(null)
    );

  const [feedback, setFeedback] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const homePageQuery = useQuery({
    queryKey: ["admin-homepage"],
    queryFn: getAdminHomePage,
  });

  const savedContent =
    homePageQuery.data?.content;

  useEffect(() => {
    if (homePageQuery.isLoading) {
      return;
    }

    setFormData(
      normalizeContent(savedContent)
    );
  }, [
    homePageQuery.isLoading,
    savedContent,
  ]);

  useEffect(() => {
    document.title =
      "Ana Sayfa Yönetimi | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  const updateMutation = useMutation({
    mutationFn: updateAdminHomePage,

    onSuccess: async () => {
      setFeedback(
        "Ana sayfa içeriği başarıyla güncellendi."
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "admin-homepage",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "home-page-content",
          ],
        }),
      ]);
    },

    onError: (error) => {
      setFormError(
        error.message ||
          "Ana sayfa güncellenemedi."
      );
    },
  });

  const updateSectionField = (
    section,
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,

      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const updateButton = (
    section,
    button,
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,

      [section]: {
        ...current[section],

        [button]: {
          ...current[section][button],
          [field]: value,
        },
      },
    }));
  };

  const updateFeatureCard = (
    cardIndex,
    field,
    value
  ) => {
    setFormData((current) => ({
      ...current,

      featureCards:
        current.featureCards.map(
          (card, index) =>
            index === cardIndex
              ? {
                  ...card,
                  [field]: value,
                }
              : card
        ),
    }));
  };

  const addFeatureCard = () => {
    setFormData((current) => ({
      ...current,

      featureCards: [
        ...current.featureCards,
        createFeatureCard(),
      ],
    }));
  };

  const removeFeatureCard = (
    cardIndex
  ) => {
    setFormData((current) => {
      if (
        current.featureCards.length ===
        1
      ) {
        return current;
      }

      return {
        ...current,

        featureCards:
          current.featureCards.filter(
            (_, index) =>
              index !== cardIndex
          ),
      };
    });
  };

  const validateForm = () => {
    if (
      formData.hero.titleFirst
        .trim().length < 2
    ) {
      return "Ana başlığın ilk satırını girin.";
    }

    if (
      formData.hero.titleSecond
        .trim().length < 2
    ) {
      return "Ana başlığın ikinci satırını girin.";
    }

    if (
      formData.hero.description
        .trim().length < 10
    ) {
      return "Ana sayfa açıklaması en az 10 karakter olmalıdır.";
    }

    const invalidCard =
      formData.featureCards.find(
        (card) =>
          !card.title.trim() ||
          !card.description.trim() ||
          !card.buttonLabel.trim() ||
          !card.path.trim()
      );

    if (invalidCard) {
      return "Özellik kartlarının tüm alanlarını doldurun.";
    }

    if (
      !formData.manifesto.title.trim()
    ) {
      return "Manifesto başlığını girin.";
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
    setFeedback("");

    await updateMutation.mutateAsync({
      hero: {
        eyebrow:
          formData.hero.eyebrow.trim(),

        titleFirst:
          formData.hero.titleFirst.trim(),

        titleSecond:
          formData.hero.titleSecond.trim(),

        description:
          formData.hero.description.trim(),

        primaryButton: {
          label:
            formData.hero.primaryButton
              .label.trim(),

          path:
            formData.hero.primaryButton
              .path.trim(),
        },

        secondaryButton: {
          label:
            formData.hero.secondaryButton
              .label.trim(),

          path:
            formData.hero.secondaryButton
              .path.trim(),
        },
      },

      featureCards:
        formData.featureCards.map(
          (card, index) => ({
            title: card.title.trim(),

            description:
              card.description.trim(),

            buttonLabel:
              card.buttonLabel.trim(),

            path: card.path.trim(),

            sortOrder: index,
          })
        ),

      manifesto: {
        eyebrow:
          formData.manifesto
            .eyebrow.trim(),

        title:
          formData.manifesto.title.trim(),

        description:
          formData.manifesto
            .description.trim(),

        primaryButton: {
          label:
            formData.manifesto
              .primaryButton.label.trim(),

          path:
            formData.manifesto
              .primaryButton.path.trim(),
        },

        secondaryButton: {
          label:
            formData.manifesto
              .secondaryButton.label.trim(),

          path:
            formData.manifesto
              .secondaryButton.path.trim(),
        },
      },

      seo: {
        title:
          formData.seo.title.trim(),

        description:
          formData.seo.description.trim(),
      },
    });
  };

  if (homePageQuery.isLoading) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />
        <p>
          Ana sayfa içeriği yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>İçerik yönetimi</p>
          <h1>Ana Sayfa</h1>
        </div>

        <span>
          Ana sayfadaki başlıkları,
          kartları, manifesto alanını ve
          SEO bilgilerini yönetin.
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

      {formError && (
        <div className="admin-form-message admin-form-message--error">
          {formError}
        </div>
      )}

      <form
        className="admin-home-editor"
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Üst bölüm</p>
              <h2>Hero Alanı</h2>
            </div>
          </div>

          <div className="admin-form">
            <div className="admin-form-field">
              <label>
                Küçük üst başlık
              </label>

              <input
                value={
                  formData.hero.eyebrow
                }
                onChange={(event) =>
                  updateSectionField(
                    "hero",
                    "eyebrow",
                    event.target.value
                  )
                }
                maxLength={100}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label>
                  Başlık ilk satır
                </label>

                <input
                  value={
                    formData.hero
                      .titleFirst
                  }
                  onChange={(event) =>
                    updateSectionField(
                      "hero",
                      "titleFirst",
                      event.target.value
                    )
                  }
                  maxLength={180}
                />
              </div>

              <div className="admin-form-field">
                <label>
                  Başlık ikinci satır
                </label>

                <input
                  value={
                    formData.hero
                      .titleSecond
                  }
                  onChange={(event) =>
                    updateSectionField(
                      "hero",
                      "titleSecond",
                      event.target.value
                    )
                  }
                  maxLength={180}
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label>Açıklama</label>

              <textarea
                value={
                  formData.hero
                    .description
                }
                onChange={(event) =>
                  updateSectionField(
                    "hero",
                    "description",
                    event.target.value
                  )
                }
                rows={5}
                maxLength={1200}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-button-editor">
                <h3>Birinci Buton</h3>

                <div className="admin-form-field">
                  <label>Buton yazısı</label>

                  <input
                    value={
                      formData.hero
                        .primaryButton
                        .label
                    }
                    onChange={(event) =>
                      updateButton(
                        "hero",
                        "primaryButton",
                        "label",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-field">
                  <label>Buton adresi</label>

                  <input
                    value={
                      formData.hero
                        .primaryButton
                        .path
                    }
                    onChange={(event) =>
                      updateButton(
                        "hero",
                        "primaryButton",
                        "path",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="admin-button-editor">
                <h3>İkinci Buton</h3>

                <div className="admin-form-field">
                  <label>Buton yazısı</label>

                  <input
                    value={
                      formData.hero
                        .secondaryButton
                        .label
                    }
                    onChange={(event) =>
                      updateButton(
                        "hero",
                        "secondaryButton",
                        "label",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-field">
                  <label>Buton adresi</label>

                  <input
                    value={
                      formData.hero
                        .secondaryButton
                        .path
                    }
                    onChange={(event) =>
                      updateButton(
                        "hero",
                        "secondaryButton",
                        "path",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading admin-panel-card__heading--actions">
            <div>
              <p>Tanıtım alanları</p>
              <h2>Özellik Kartları</h2>
            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={addFeatureCard}
              disabled={
                formData.featureCards
                  .length >= 6
              }
            >
              <Plus size={16} />
              Kart Ekle
            </button>
          </div>

          <div className="admin-home-cards">
            {formData.featureCards.map(
              (card, cardIndex) => (
                <article
                  className="admin-home-card-editor"
                  key={`home-card-${cardIndex}`}
                >
                  <div className="admin-home-card-editor__header">
                    <strong>
                      Kart {cardIndex + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeFeatureCard(
                          cardIndex
                        )
                      }
                      disabled={
                        formData
                          .featureCards
                          .length === 1
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="admin-form-field">
                    <label>Kart başlığı</label>

                    <input
                      value={card.title}
                      onChange={(event) =>
                        updateFeatureCard(
                          cardIndex,
                          "title",
                          event.target.value
                        )
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
                      onChange={(event) =>
                        updateFeatureCard(
                          cardIndex,
                          "description",
                          event.target.value
                        )
                      }
                      rows={5}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-field">
                      <label>
                        Buton yazısı
                      </label>

                      <input
                        value={
                          card.buttonLabel
                        }
                        onChange={(event) =>
                          updateFeatureCard(
                            cardIndex,
                            "buttonLabel",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="admin-form-field">
                      <label>
                        Buton adresi
                      </label>

                      <input
                        value={card.path}
                        onChange={(event) =>
                          updateFeatureCard(
                            cardIndex,
                            "path",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Alt çağrı alanı</p>
              <h2>Manifesto Bölümü</h2>
            </div>
          </div>

          <div className="admin-form">
            <div className="admin-form-field">
              <label>Küçük üst başlık</label>

              <input
                value={
                  formData.manifesto
                    .eyebrow
                }
                onChange={(event) =>
                  updateSectionField(
                    "manifesto",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="admin-form-field">
              <label>Manifesto başlığı</label>

              <input
                value={
                  formData.manifesto.title
                }
                onChange={(event) =>
                  updateSectionField(
                    "manifesto",
                    "title",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="admin-form-field">
              <label>
                Manifesto açıklaması
              </label>

              <textarea
                value={
                  formData.manifesto
                    .description
                }
                onChange={(event) =>
                  updateSectionField(
                    "manifesto",
                    "description",
                    event.target.value
                  )
                }
                rows={6}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-button-editor">
                <h3>Birinci Buton</h3>

                <div className="admin-form-field">
                  <label>Buton yazısı</label>

                  <input
                    value={
                      formData.manifesto
                        .primaryButton
                        .label
                    }
                    onChange={(event) =>
                      updateButton(
                        "manifesto",
                        "primaryButton",
                        "label",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-field">
                  <label>Buton adresi</label>

                  <input
                    value={
                      formData.manifesto
                        .primaryButton
                        .path
                    }
                    onChange={(event) =>
                      updateButton(
                        "manifesto",
                        "primaryButton",
                        "path",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="admin-button-editor">
                <h3>İkinci Buton</h3>

                <div className="admin-form-field">
                  <label>Buton yazısı</label>

                  <input
                    value={
                      formData.manifesto
                        .secondaryButton
                        .label
                    }
                    onChange={(event) =>
                      updateButton(
                        "manifesto",
                        "secondaryButton",
                        "label",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="admin-form-field">
                  <label>Buton adresi</label>

                  <input
                    value={
                      formData.manifesto
                        .secondaryButton
                        .path
                    }
                    onChange={(event) =>
                      updateButton(
                        "manifesto",
                        "secondaryButton",
                        "path",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
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
              <label>SEO başlığı</label>

              <input
                value={formData.seo.title}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,

                    seo: {
                      ...current.seo,
                      title:
                        event.target.value,
                    },
                  }))
                }
                maxLength={70}
              />

              <small>
                {formData.seo.title.length}
                /70 karakter
              </small>
            </div>

            <div className="admin-form-field">
              <label>SEO açıklaması</label>

              <textarea
                value={
                  formData.seo.description
                }
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,

                    seo: {
                      ...current.seo,
                      description:
                        event.target.value,
                    },
                  }))
                }
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

        <div className="admin-home-editor__actions">
          <button
            type="submit"
            className="admin-primary-button"
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
                Ana Sayfayı Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHomePage;
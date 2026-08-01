import {
  Save,
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
  getAdminSiteSettings,
  updateAdminSiteSettings,
} from "../../services/adminSiteSettingService";

import ImageUploadField from "../../components/admin/ImageUploadField";

const defaultSettings = {
    branding: {
  logo: {
    url: "",
    publicId: "",
    alt: "Bir Parti logosu",
  },

  favicon: {
    url: "",
    publicId: "",
    alt: "Bir Parti faviconu",
  },
},
  identity: {
    siteName: "BİR PARTİ",
    shortName: "Bir Parti",
    description:
      "Bu bir parti sitesi değil. Bu bir vicdan çağrısı.",
  },

  contact: {
    email: "bilgi@birparti.com",
    phone: "",
    address: "",
  },

  footer: {
    primaryText:
      "Bu bir parti sitesi değil.",

    secondaryText:
      "Bu bir vicdan çağrısı.",

    copyrightText:
      "BİR PARTİ | Tüm hakları saklıdır.",
  },

  socialLinks: {
    instagram: "",
    facebook: "",
    x: "",
    youtube: "",
    linkedin: "",
  },

  features: {
    maintenanceMode: false,
    registrationsEnabled: true,
    forumEnabled: true,
  },

  maintenanceMessage:
    "Sitemiz kısa süreli bir bakım çalışmasındadır.",
};

const normalizeSettings = (
  settings
) => ({
  branding: {
    logo: {
      ...defaultSettings
        .branding.logo,

      ...settings?.branding
        ?.logo,
    },

    favicon: {
      ...defaultSettings
        .branding.favicon,

      ...settings?.branding
        ?.favicon,
    },
  },

  identity: {
    ...defaultSettings.identity,
    ...settings?.identity,
  },

  contact: {
    ...defaultSettings.contact,
    ...settings?.contact,
  },

  footer: {
    ...defaultSettings.footer,
    ...settings?.footer,
  },

  socialLinks: {
    ...defaultSettings.socialLinks,
    ...settings?.socialLinks,
  },

  features: {
    ...defaultSettings.features,
    ...settings?.features,
  },

  maintenanceMessage:
    settings?.maintenanceMessage ||
    defaultSettings.maintenanceMessage,
});

const AdminSiteSettingsPage = () => {
    const [
  isUploading,
  setIsUploading,
] = useState(false);
  const queryClient =
    useQueryClient();

  const [
    formData,
    setFormData,
  ] = useState(
    defaultSettings
  );

  const [
    feedback,
    setFeedback,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const settingsQuery =
    useQuery({
      queryKey: [
        "admin-site-settings",
      ],

      queryFn:
        getAdminSiteSettings,
    });

  useEffect(() => {
    if (
      settingsQuery.data
        ?.settings
    ) {
      setFormData(
        normalizeSettings(
          settingsQuery.data
            .settings
        )
      );
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    document.title =
      "Site Ayarları | Bir Parti Yönetim";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const updateMutation =
    useMutation({
      mutationFn:
        updateAdminSiteSettings,

      onSuccess: async () => {
        setFeedback(
          "Site ayarları başarıyla güncellendi."
        );

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "admin-site-settings",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "site-settings",
            ],
          }),
        ]);
      },

      onError: (error) => {
        setFormError(
          error.message ||
            "Site ayarları güncellenemedi."
        );
      },
    });

  const updateGroup = (
    group,
    field,
    value
  ) => {
    setFormData(
      (current) => ({
        ...current,

        [group]: {
          ...current[group],
          [field]: value,
        },
      })
    );
  };
const updateBrandingImage = (
  field,
  values
) => {
  setFormData(
    (current) => ({
      ...current,

      branding: {
        ...current.branding,

        [field]: {
          ...current
            .branding[field],

          ...values,
        },
      },
    })
  );
};
  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setFeedback("");
    setFormError("");

    updateMutation.mutate({
        branding: {
  logo: {
    url:
      formData.branding
        .logo.url.trim(),

    publicId:
      formData.branding
        .logo.publicId.trim(),

    alt:
      formData.branding
        .logo.alt.trim(),
  },

  favicon: {
    url:
      formData.branding
        .favicon.url.trim(),

    publicId:
      formData.branding
        .favicon.publicId.trim(),

    alt:
      formData.branding
        .favicon.alt.trim(),
  },
},
      identity: {
        siteName:
          formData.identity
            .siteName.trim(),

        shortName:
          formData.identity
            .shortName.trim(),

        description:
          formData.identity
            .description.trim(),
      },

      contact: {
        email:
          formData.contact
            .email.trim(),

        phone:
          formData.contact
            .phone.trim(),

        address:
          formData.contact
            .address.trim(),
      },

      footer: {
        primaryText:
          formData.footer
            .primaryText.trim(),

        secondaryText:
          formData.footer
            .secondaryText.trim(),

        copyrightText:
          formData.footer
            .copyrightText.trim(),
      },

      socialLinks:
        Object.fromEntries(
          Object.entries(
            formData.socialLinks
          ).map(
            ([key, value]) => [
              key,
              value.trim(),
            ]
          )
        ),

      features:
        formData.features,

      maintenanceMessage:
        formData
          .maintenanceMessage
          .trim(),
    });
  };

  if (
    settingsQuery.isLoading
  ) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />

        <p>
          Site ayarları
          yükleniyor...
        </p>
      </div>
    );
  }

  if (
    settingsQuery.isError
  ) {
    return (
      <div className="admin-state">
        <h1>
          Site ayarları
          yüklenemedi.
        </h1>

        <button
          type="button"
          onClick={() =>
            settingsQuery.refetch()
          }
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Genel yönetim</p>
          <h1>Site Ayarları</h1>
        </div>

        <span>
          Site kimliği, iletişim,
          footer ve özellik
          ayarlarını yönetin.
        </span>
      </div>

      {feedback && (
        <div className="admin-feedback">
          {feedback}
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
      >
        <section className="admin-panel-card">
  <div className="admin-panel-card__heading">
    <div>
      <p>Marka görselleri</p>

      <h2>
        Logo ve Favicon
      </h2>
    </div>
  </div>

  <div className="admin-form-row">
    <ImageUploadField
      id="site-logo"
      label="Site logosu"
      folderKey="site-logo"
      value={
        formData.branding
          .logo.url
      }
      altValue={
        formData.branding
          .logo.alt
      }
      disabled={
        updateMutation
          .isPending
      }
      onUploadingChange={
        setIsUploading
      }
      onChange={(
        url,
        publicId
      ) =>
        updateBrandingImage(
          "logo",
          {
            url,
            publicId,
          }
        )
      }
      onAltChange={(alt) =>
        updateBrandingImage(
          "logo",
          {
            alt,
          }
        )
      }
    />

    <ImageUploadField
      id="site-favicon"
      label="Favicon"
      folderKey="site-favicon"
      value={
        formData.branding
          .favicon.url
      }
      altValue={
        formData.branding
          .favicon.alt
      }
      disabled={
        updateMutation
          .isPending
      }
      onUploadingChange={
        setIsUploading
      }
      onChange={(
        url,
        publicId
      ) =>
        updateBrandingImage(
          "favicon",
          {
            url,
            publicId,
          }
        )
      }
      onAltChange={(alt) =>
        updateBrandingImage(
          "favicon",
          {
            alt,
          }
        )
      }
    />
  </div>
</section>
        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Marka</p>
              <h2>Site Kimliği</h2>
            </div>
          </div>

          <div className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label>Site adı</label>

                <input
                  value={
                    formData.identity
                      .siteName
                  }
                  onChange={(event) =>
                    updateGroup(
                      "identity",
                      "siteName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-field">
                <label>
                  Kısa site adı
                </label>

                <input
                  value={
                    formData.identity
                      .shortName
                  }
                  onChange={(event) =>
                    updateGroup(
                      "identity",
                      "shortName",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label>
                Site açıklaması
              </label>

              <textarea
                rows={4}
                maxLength={500}
                value={
                  formData.identity
                    .description
                }
                onChange={(event) =>
                  updateGroup(
                    "identity",
                    "description",
                    event.target.value
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>İletişim</p>
              <h2>İletişim Bilgileri</h2>
            </div>
          </div>

          <div className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label>E-posta</label>

                <input
                  type="email"
                  value={
                    formData.contact
                      .email
                  }
                  onChange={(event) =>
                    updateGroup(
                      "contact",
                      "email",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-field">
                <label>Telefon</label>

                <input
                  value={
                    formData.contact
                      .phone
                  }
                  onChange={(event) =>
                    updateGroup(
                      "contact",
                      "phone",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label>Adres</label>

              <textarea
                rows={3}
                value={
                  formData.contact
                    .address
                }
                onChange={(event) =>
                  updateGroup(
                    "contact",
                    "address",
                    event.target.value
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Alt alan</p>
              <h2>Footer Metinleri</h2>
            </div>
          </div>

          <div className="admin-form">
            {[
              [
                "primaryText",
                "Ana metin",
              ],
              [
                "secondaryText",
                "İkinci metin",
              ],
              [
                "copyrightText",
                "Telif hakkı metni",
              ],
            ].map(
              ([field, label]) => (
                <div
                  className="admin-form-field"
                  key={field}
                >
                  <label>{label}</label>

                  <input
                    value={
                      formData.footer[
                        field
                      ]
                    }
                    onChange={(
                      event
                    ) =>
                      updateGroup(
                        "footer",
                        field,
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              )
            )}
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Bağlantılar</p>
              <h2>Sosyal Medya</h2>
            </div>
          </div>

          <div className="admin-form">
            {[
              ["instagram", "Instagram"],
              ["facebook", "Facebook"],
              ["x", "X"],
              ["youtube", "YouTube"],
              ["linkedin", "LinkedIn"],
            ].map(
              ([field, label]) => (
                <div
                  className="admin-form-field"
                  key={field}
                >
                  <label>{label}</label>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={
                      formData
                        .socialLinks[
                        field
                      ]
                    }
                    onChange={(
                      event
                    ) =>
                      updateGroup(
                        "socialLinks",
                        field,
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              )
            )}
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Sistem</p>
              <h2>Özellik Ayarları</h2>
            </div>
          </div>

          <div className="admin-form">
            {[
              [
                "maintenanceMode",
                "Bakım modu",
              ],
              [
                "registrationsEnabled",
                "Yeni üyelikler",
              ],
              [
                "forumEnabled",
                "Forum",
              ],
            ].map(
              ([field, label]) => (
                <div
                  className="admin-form-field"
                  key={field}
                >
                  <label>{label}</label>

                  <select
                    value={String(
                      formData.features[
                        field
                      ]
                    )}
                    onChange={(
                      event
                    ) =>
                      updateGroup(
                        "features",
                        field,
                        event.target
                          .value ===
                          "true"
                      )
                    }
                  >
                    <option value="true">
                      Açık
                    </option>

                    <option value="false">
                      Kapalı
                    </option>
                  </select>
                </div>
              )
            )}

            <div className="admin-form-field">
              <label>Bakım mesajı</label>

              <textarea
                rows={4}
                maxLength={500}
                value={
                  formData
                    .maintenanceMessage
                }
                onChange={(event) =>
                  setFormData(
                    (current) => ({
                      ...current,

                      maintenanceMessage:
                        event.target
                          .value,
                    })
                  )
                }
              />
            </div>
          </div>
        </section>

        <div className="admin-home-editor__actions">
          <button
            type="submit"
            className="admin-primary-button"
            disabled={
  updateMutation.isPending ||
  isUploading
}
          >
            <Save size={18} />

            {updateMutation.isPending
              ? "Kaydediliyor..."
              : "Site Ayarlarını Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSiteSettingsPage;
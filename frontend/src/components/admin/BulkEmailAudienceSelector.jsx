import {
  Search,
  UserPlus,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getBulkEmailRecipientOptions,
} from "../../services/adminBulkEmailService";

const roleOptions = [
  {
    value: "member",
    label: "Üyeler",
  },
  {
    value: "moderator",
    label: "Moderatörler",
  },
  {
    value: "contentEditor",
    label: "İçerik Editörleri",
  },
  {
    value: "financeManager",
    label: "Finans Yöneticileri",
  },
  {
    value: "admin",
    label: "Yöneticiler",
  },
  {
    value: "superAdmin",
    label: "Süper Yöneticiler",
  },
];

const roleLabels =
  Object.fromEntries(
    roleOptions.map(
      (role) => [
        role.value,
        role.label,
      ]
    )
  );

const audienceModeOptions = [
  {
    value: "all",
    label: "Tüm uygun üyeler",
    description:
      "E-posta türüne uygun olan bütün aktif ve doğrulanmış üyeler.",
  },
  {
    value: "roles",
    label: "Rollere göre",
    description:
      "Seçtiğiniz rollerde bulunan uygun üyeler.",
  },
  {
    value: "selected",
    label: "Üye seçerek",
    description:
      "İsmi veya e-posta adresiyle seçtiğiniz üyeler.",
  },
];

const getRecipientId = (
  recipient
) => {
  if (
    typeof recipient ===
    "string"
  ) {
    return recipient;
  }

  return recipient?._id || "";
};

const getRecipientName = (
  recipient
) => {
  const fullName =
    recipient.fullName ||
    `${recipient.firstName || ""} ${
      recipient.lastName || ""
    }`.trim();

  return (
    fullName ||
    recipient.email ||
    "İsimsiz üye"
  );
};

const BulkEmailAudienceSelector = ({
  emailType,
  audienceMode,
  audienceRoles,
  selectedRecipients,
  onChange,
}) => {
  const [
    search,
    setSearch,
  ] = useState("");

  const normalizedSearch =
    search.trim();

  const recipientsQuery =
    useQuery({
      queryKey: [
        "admin-bulk-email-recipient-options",
        emailType,
        normalizedSearch,
      ],

      queryFn: () =>
        getBulkEmailRecipientOptions({
          emailType,
          search:
            normalizedSearch,
        }),

      enabled:
        audienceMode ===
          "selected" &&
        normalizedSearch.length >=
          2,

      staleTime: 30000,
    });

  const users =
    recipientsQuery.data
      ?.users || [];

  const selectedIds =
    new Set(
      selectedRecipients
        .map(getRecipientId)
        .filter(Boolean)
    );

  const handleModeChange = (
    mode
  ) => {
    onChange({
      audienceMode: mode,
    });
  };

  const handleRoleChange = (
    role
  ) => {
    const isSelected =
      audienceRoles.includes(
        role
      );

    onChange({
      audienceRoles:
        isSelected
          ? audienceRoles.filter(
              (item) =>
                item !== role
            )
          : [
              ...audienceRoles,
              role,
            ],
    });
  };

  const handleAddRecipient = (
    user
  ) => {
    if (
      selectedIds.has(user._id) ||
      selectedRecipients.length >=
        500
    ) {
      return;
    }

    onChange({
      selectedRecipients: [
        ...selectedRecipients,
        user,
      ],
    });
  };

  const handleRemoveRecipient = (
    recipientId
  ) => {
    onChange({
      selectedRecipients:
        selectedRecipients.filter(
          (recipient) =>
            getRecipientId(
              recipient
            ) !== recipientId
        ),
    });
  };

  return (
    <section className="bulk-email-audience-selector">
      <fieldset className="bulk-email-mode-fieldset">
        <legend>
          E-posta alıcıları
        </legend>

        <p>
          Kampanyanın hangi üyelere
          gönderileceğini seçin.
        </p>

        <div className="bulk-email-mode-grid">
          {audienceModeOptions.map(
            (option) => (
              <label
                className="bulk-email-mode-option"
                key={option.value}
              >
                <input
                  type="radio"
                  name="audienceMode"
                  value={
                    option.value
                  }
                  checked={
                    audienceMode ===
                    option.value
                  }
                  onChange={() =>
                    handleModeChange(
                      option.value
                    )
                  }
                />

                <span>
                  <strong>
                    {option.label}
                  </strong>

                  <small>
                    {
                      option.description
                    }
                  </small>
                </span>
              </label>
            )
          )}
        </div>
      </fieldset>

      {audienceMode ===
        "roles" && (
        <fieldset className="bulk-email-role-fieldset">
          <legend>
            Hedef üye rolleri
          </legend>

          <p>
            En az bir rol seçmelisiniz.
          </p>

          <div className="bulk-email-role-grid">
            {roleOptions.map(
              (role) => (
                <label
                  className="admin-form-checkbox admin-form-checkbox--boxed"
                  key={role.value}
                >
                  <input
                    type="checkbox"
                    checked={audienceRoles.includes(
                      role.value
                    )}
                    onChange={() =>
                      handleRoleChange(
                        role.value
                      )
                    }
                  />

                  <span>
                    <strong>
                      {role.label}
                    </strong>
                  </span>
                </label>
              )
            )}
          </div>
        </fieldset>
      )}

      {audienceMode ===
        "selected" && (
        <div className="bulk-email-recipient-area">
          <div>
            <strong>
              Üye ara ve seç
            </strong>

            <p>
              Ad, soyad veya e-posta
              adresinin en az iki
              karakterini yazın.
            </p>
          </div>

          <div className="bulk-email-recipient-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Örnek: yunus veya kullanici@mail.com"
              maxLength={160}
            />
          </div>

          {normalizedSearch.length >
            0 &&
            normalizedSearch.length <
              2 && (
              <p className="bulk-email-recipient-info">
                Arama için en az iki
                karakter yazın.
              </p>
            )}

          {recipientsQuery.isLoading && (
            <p className="bulk-email-recipient-info">
              Üyeler aranıyor...
            </p>
          )}

          {recipientsQuery.isError && (
            <p className="bulk-email-recipient-error">
              Üye araması yapılamadı.
              Tekrar deneyin.
            </p>
          )}

          {normalizedSearch.length >=
            2 &&
            !recipientsQuery.isLoading &&
            !recipientsQuery.isError &&
            users.length === 0 && (
              <p className="bulk-email-recipient-info">
                Gönderim koşullarına
                uygun üye bulunamadı.
              </p>
            )}

          {users.length > 0 && (
            <div className="bulk-email-recipient-results">
              {users.map(
                (user) => {
                  const isSelected =
                    selectedIds.has(
                      user._id
                    );

                  return (
                    <div
                      className="bulk-email-recipient-result"
                      key={user._id}
                    >
                      <div>
                        <strong>
                          {getRecipientName(
                            user
                          )}
                        </strong>

                        <span>
                          {user.email}
                          {" · "}
                          {roleLabels[
                            user.role
                          ] ||
                            user.role}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={
                          isSelected ||
                          selectedRecipients.length >=
                            500
                        }
                        onClick={() =>
                          handleAddRecipient(
                            user
                          )
                        }
                      >
                        <UserPlus
                          size={16}
                        />

                        {isSelected
                          ? "Seçildi"
                          : "Ekle"}
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <div className="bulk-email-selected-heading">
            <strong>
              Seçilen üyeler
            </strong>

            <span>
              {
                selectedRecipients.length
              }
              /500
            </span>
          </div>

          {selectedRecipients.length ===
          0 ? (
            <p className="bulk-email-recipient-info">
              Henüz bir üye
              seçilmedi.
            </p>
          ) : (
            <div className="bulk-email-selected-list">
              {selectedRecipients.map(
                (recipient) => {
                  const recipientId =
                    getRecipientId(
                      recipient
                    );

                  return (
                    <div
                      className="bulk-email-selected-recipient"
                      key={
                        recipientId
                      }
                    >
                      <div>
                        <strong>
                          {getRecipientName(
                            recipient
                          )}
                        </strong>

                        <span>
                          {
                            recipient.email
                          }
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label={`${getRecipientName(
                          recipient
                        )} seçimini kaldır`}
                        onClick={() =>
                          handleRemoveRecipient(
                            recipientId
                          )
                        }
                      >
                        <X
                          size={17}
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default BulkEmailAudienceSelector;
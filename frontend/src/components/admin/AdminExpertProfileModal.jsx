import {
  BadgeCheck,
  X,
} from "lucide-react";
import {
  useState,
} from "react";

const AdminExpertProfileModal = ({
  user,
  isSaving,
  onClose,
  onSave,
}) => {
  const [
    formData,
    setFormData,
  ] = useState({
    isVerified:
      Boolean(
        user.expertProfile
          ?.isVerified
      ),

    title:
      user.expertProfile
        ?.title || "",

    area:
      user.expertProfile
        ?.area || "",

    bio:
      user.expertProfile
        ?.bio || "",
  });

  const [
    formError,
    setFormError,
  ] = useState("");

  const updateField = (
    field,
    value
  ) => {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setFormError("");
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      formData.isVerified &&
      formData.title
        .trim().length < 2
    ) {
      setFormError(
        "Uzman unvanı en az 2 karakter olmalıdır."
      );

      return;
    }

    if (
      formData.isVerified &&
      formData.area
        .trim().length < 2
    ) {
      setFormError(
        "Uzmanlık alanı en az 2 karakter olmalıdır."
      );

      return;
    }

    onSave({
      userId: user.id,

      formData: {
        isVerified:
          formData.isVerified,

        title:
          formData.title.trim(),

        area:
          formData.area.trim(),

        bio:
          formData.bio.trim(),
      },
    });
  };

  return (
    <div
      className="admin-expert-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <form
        className="admin-expert-modal__dialog"
        onSubmit={handleSubmit}
      >
        <div className="admin-expert-modal__heading">
          <div>
            <span>
              <BadgeCheck
                size={18}
              />
              Uzman profili
            </span>

            <h2>
              {user.fullName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Pencereyi kapat"
          >
            <X size={20} />
          </button>
        </div>

        <label className="admin-form-checkbox admin-form-checkbox--boxed">
          <input
            type="checkbox"
            checked={
              formData.isVerified
            }
            onChange={(event) =>
              updateField(
                "isVerified",
                event.target.checked
              )
            }
          />

          <span>
            <strong>
              Doğrulanmış uzman
            </strong>

            <small>
              Kullanıcının forumda
              uzman rozeti taşımasını
              sağlar.
            </small>
          </span>
        </label>

        <div className="admin-form-field">
          <label>
            Uzman unvanı
          </label>

          <input
            value={formData.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
              )
            }
            disabled={
              !formData.isVerified
            }
            maxLength={120}
            placeholder="Örnek: Ekonomi Uzmanı"
          />

          <small>
            {formData.title.length}
            /120 karakter
          </small>
        </div>

        <div className="admin-form-field">
          <label>
            Uzmanlık alanı
          </label>

          <input
            value={formData.area}
            onChange={(event) =>
              updateField(
                "area",
                event.target.value
              )
            }
            disabled={
              !formData.isVerified
            }
            maxLength={180}
            placeholder="Örnek: Makroekonomi ve kamu maliyesi"
          />

          <small>
            {formData.area.length}
            /180 karakter
          </small>
        </div>

        <div className="admin-form-field">
          <label>
            Kısa uzman açıklaması
          </label>

          <textarea
            value={formData.bio}
            onChange={(event) =>
              updateField(
                "bio",
                event.target.value
              )
            }
            disabled={
              !formData.isVerified
            }
            maxLength={600}
            rows={5}
            placeholder="Kullanıcının deneyimi ve çalışma alanları..."
          />

          <small>
            {formData.bio.length}
            /600 karakter
          </small>
        </div>

        {formError && (
          <div className="admin-form-message admin-form-message--error">
            {formError}
          </div>
        )}

        <div className="admin-expert-modal__actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={onClose}
            disabled={isSaving}
          >
            Vazgeç
          </button>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={isSaving}
          >
            {isSaving
              ? "Kaydediliyor..."
              : formData.isVerified
                ? "Uzmanlığı Kaydet"
                : "Uzmanlığı Kaldır"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminExpertProfileModal;
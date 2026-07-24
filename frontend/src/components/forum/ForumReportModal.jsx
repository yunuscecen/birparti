import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  reportForumContent,
} from "../../services/forumService";

const reportReasons = [
  {
    value: "spam",
    label: "Spam veya reklam",
  },
  {
    value: "harassment",
    label: "Taciz veya hakaret",
  },
  {
    value: "hate",
    label: "Nefret söylemi",
  },
  {
    value: "misinformation",
    label: "Yanıltıcı bilgi",
  },
  {
    value: "personal_data",
    label: "Kişisel bilgi paylaşımı",
  },
  {
    value: "other",
    label: "Diğer",
  },
];

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data
      ?.message ||
    error?.message ||
    fallback
  );
};

const ForumReportModal = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetLabel = "Forum içeriği",
}) => {
  const [
    reason,
    setReason,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isCompleted,
    setIsCompleted,
  ] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setReason("");
    setDescription("");
    setErrorMessage("");
    setIsCompleted(false);

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  const reportMutation =
    useMutation({
      mutationFn:
        reportForumContent,

      onSuccess: () => {
        setIsCompleted(true);
        setErrorMessage("");
      },

      onError: (error) => {
        setErrorMessage(
          getErrorMessage(
            error,
            "Bildirim gönderilemedi."
          )
        );
      },
    });

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!reason) {
      setErrorMessage(
        "Bir bildirim nedeni seçmelisiniz."
      );

      return;
    }

    setErrorMessage("");

    try {
      await reportMutation.mutateAsync({
        targetType,
        targetId,
        reason,
        description:
          description.trim(),
      });
    } catch {
      /*
       * Hata mesajı mutation içindeki
       * onError tarafından gösterilir.
       */
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="forum-report-modal"
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
      <div
        className="forum-report-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forum-report-title"
      >
        <button
          type="button"
          className="forum-report-modal__close"
          onClick={onClose}
          aria-label="Pencereyi kapat"
        >
          <X size={19} />
        </button>

        {isCompleted ? (
          <div className="forum-report-success">
            <CheckCircle2
              size={38}
            />

            <h2>
              Bildiriminiz alındı
            </h2>

            <p>
              Bildiriminiz yönetim
              ekibine iletildi ve
              incelenecek.
            </p>

            <button
              type="button"
              className="forum-primary-button"
              onClick={onClose}
            >
              Kapat
            </button>
          </div>
        ) : (
          <>
            <div className="forum-report-modal__heading">
              <span>
                <Flag size={18} />
              </span>

              <div>
                <p>
                  İçerik bildirimi
                </p>

                <h2 id="forum-report-title">
                  {targetLabel}
                </h2>
              </div>
            </div>

            <div className="forum-report-warning">
              <AlertTriangle
                size={18}
              />

              <p>
                Bildirimler yalnızca
                topluluk kurallarını
                ihlal eden içerikler
                için kullanılmalıdır.
              </p>
            </div>

            <form
              className="forum-report-form"
              onSubmit={
                handleSubmit
              }
              noValidate
            >
              {errorMessage && (
                <div className="forum-form-error">
                  {errorMessage}
                </div>
              )}

              <div className="forum-form-field">
                <label htmlFor="forum-report-reason">
                  Bildirim nedeni
                </label>

                <select
                  id="forum-report-reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Neden seçin
                  </option>

                  {reportReasons.map(
                    (item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="forum-form-field">
                <label htmlFor="forum-report-description">
                  Açıklama
                </label>

                <textarea
                  id="forum-report-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={5}
                  maxLength={1000}
                  placeholder="İhlali kısaca açıklayın..."
                />

                <small>
                  {description.length}/1000
                  karakter
                </small>
              </div>

              <div className="forum-report-form__actions">
                <button
                  type="button"
                  className="forum-secondary-button"
                  onClick={onClose}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="forum-primary-button"
                  disabled={
                    reportMutation.isPending
                  }
                >
                  <Flag size={16} />

                  {reportMutation.isPending
                    ? "Gönderiliyor..."
                    : "Bildirimi Gönder"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForumReportModal;
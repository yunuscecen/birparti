import {
  useEffect,
  useRef,
  useState,
} from "react";

const KREOSUS_SCRIPT_ID =
  "kreosus-iframe-api";

const KREOSUS_SCRIPT_URL =
  "https://kreosus.com/public/kreosus/iframe/js/iframe-api.js";

const KreosusEmbed = ({
  creatorId,
}) => {
  const containerRef =
    useRef(null);

  const [
    loadStatus,
    setLoadStatus,
  ] = useState("loading");

  useEffect(() => {
    const container =
      containerRef.current;

    if (
      !container ||
      !creatorId
    ) {
      setLoadStatus("error");

      return undefined;
    }

    let isActive = true;

    setLoadStatus("loading");

    container.innerHTML = "";

    const markAsReady =
      () => {
        if (
          isActive &&
          container.querySelector(
            "iframe"
          )
        ) {
          setLoadStatus(
            "ready"
          );
        }
      };

    const observer =
      new MutationObserver(
        markAsReady
      );

    observer.observe(
      container,
      {
        childList: true,
        subtree: true,
      }
    );

    const previousScript =
      document.getElementById(
        KREOSUS_SCRIPT_ID
      );

    if (previousScript) {
      previousScript.remove();
    }

    const script =
      document.createElement(
        "script"
      );

    script.id =
      KREOSUS_SCRIPT_ID;

    script.src =
      KREOSUS_SCRIPT_URL;

    script.async = true;

    script.onload =
      markAsReady;

    script.onerror =
      () => {
        if (isActive) {
          setLoadStatus(
            "error"
          );
        }
      };

    document.body.appendChild(
      script
    );

    const timeoutId =
      window.setTimeout(
        () => {
          if (
            isActive &&
            !container.querySelector(
              "iframe"
            )
          ) {
            setLoadStatus(
              "error"
            );
          }
        },
        15000
      );

    return () => {
      isActive = false;

      window.clearTimeout(
        timeoutId
      );

      observer.disconnect();

      script.onload = null;
      script.onerror = null;

      script.remove();

      container.innerHTML =
        "";
    };
  }, [creatorId]);

  return (
    <div
      className={`kreosus-embed kreosus-embed--${loadStatus}`}
    >
      {loadStatus ===
        "loading" && (
        <div className="kreosus-embed__state">
          <span className="auth-spinner" />

          <p>
            Kreosus destek
            modülü yükleniyor...
          </p>
        </div>
      )}

      <div
        id="kreosus"
        ref={containerRef}
        data-id={creatorId}
        data-start-page="0"
        data-bg-color="ffffff"
        data-iframe-api="true"
      />

      {loadStatus ===
        "error" && (
        <div className="kreosus-embed__state kreosus-embed__state--error">
          <strong>
            Destek modülü
            yüklenemedi.
          </strong>

          <p>
            Aşağıdaki bağlantıyı
            kullanarak Kreosus
            sayfasına geçebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};

export default KreosusEmbed;
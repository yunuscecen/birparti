import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getPublicSiteSettings,
} from "../services/siteSettingService";

const fallbackSettings = {
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

const SiteSettingsContext =
  createContext(null);

const normalizeSettings = (
  settings
) => ({
  branding: {
    logo: {
      ...fallbackSettings
        .branding.logo,
      ...settings?.branding
        ?.logo,
    },

    favicon: {
      ...fallbackSettings
        .branding.favicon,
      ...settings?.branding
        ?.favicon,
    },
  },

  identity: {
    ...fallbackSettings.identity,
    ...settings?.identity,
  },

  contact: {
    ...fallbackSettings.contact,
    ...settings?.contact,
  },

  footer: {
    ...fallbackSettings.footer,
    ...settings?.footer,
  },

  socialLinks: {
    ...fallbackSettings.socialLinks,
    ...settings?.socialLinks,
  },

  features: {
    ...fallbackSettings.features,
    ...settings?.features,
  },

  maintenanceMessage:
    settings?.maintenanceMessage ||
    fallbackSettings
      .maintenanceMessage,
});

export const SiteSettingsProvider = ({
  children,
}) => {
    const previousShortNameRef =
  useRef("Bir Parti");

  const settingsQuery =
    useQuery({
      queryKey: [
        "site-settings",
      ],

      queryFn:
        getPublicSiteSettings,

      staleTime:
        5 * 60 * 1000,

      retry: 2,
    });

  const settings =
    useMemo(
      () =>
        normalizeSettings(
          settingsQuery.data
            ?.settings
        ),
      [settingsQuery.data]
    );

  useEffect(() => {
    const faviconUrl =
      settings.branding
        .favicon.url;

    let favicon =
      document.querySelector(
        'link[rel~="icon"]'
      );

    if (!faviconUrl) {
      favicon?.remove();
      return;
    }

    if (!favicon) {
      favicon =
        document.createElement(
          "link"
        );

      favicon.rel = "icon";

      document.head.appendChild(
        favicon
      );
    }

    favicon.href =
      faviconUrl;
  }, [
    settings.branding
      .favicon.url,
  ]);



  useEffect(() => {
  const shortName =
    settings.identity
      .shortName ||
    "Bir Parti";

  const previousShortName =
    previousShortNameRef
      .current;

  let titleElement =
    document.querySelector(
      "title"
    );

  if (!titleElement) {
    titleElement =
      document.createElement(
        "title"
      );

    document.head.appendChild(
      titleElement
    );
  }

  const normalizeTitle = () => {
    const currentTitle =
      document.title.trim();

    if (!currentTitle) {
      document.title =
        shortName;

      return;
    }

    const candidates = [
      "Bir Parti",
      "BİR PARTİ",
      previousShortName,
      shortName,
    ].filter(Boolean);

    let nextTitle =
      currentTitle;

    for (
      const candidate
      of candidates
    ) {
      if (
        currentTitle ===
        candidate
      ) {
        nextTitle =
          shortName;

        break;
      }

      if (
        currentTitle ===
        `${candidate} Yönetim`
      ) {
        nextTitle =
          `${shortName} Yönetim`;

        break;
      }

      const publicSuffix =
        ` | ${candidate}`;

      const adminSuffix =
        ` | ${candidate} Yönetim`;

      if (
        currentTitle.endsWith(
          adminSuffix
        )
      ) {
        nextTitle =
          `${currentTitle.slice(
            0,
            -adminSuffix.length
          )} | ${shortName} Yönetim`;

        break;
      }

      if (
        currentTitle.endsWith(
          publicSuffix
        )
      ) {
        nextTitle =
          `${currentTitle.slice(
            0,
            -publicSuffix.length
          )} | ${shortName}`;

        break;
      }
    }

    if (
      nextTitle !==
      currentTitle
    ) {
      document.title =
        nextTitle;
    }
  };

  normalizeTitle();

  const observer =
    new MutationObserver(
      normalizeTitle
    );

  observer.observe(
    titleElement,
    {
      childList: true,
      characterData: true,
      subtree: true,
    }
  );

  previousShortNameRef.current =
    shortName;

  return () => {
    observer.disconnect();
  };
}, [
  settings.identity
    .shortName,
]);

  useEffect(() => {
    const description =
      settings.identity
        .description;

    if (!description) {
      return;
    }

    let meta =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!meta) {
      meta =
        document.createElement(
          "meta"
        );

      meta.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(
        meta
      );
    }

    meta.setAttribute(
      "content",
      description
    );
  }, [
    settings.identity
      .description,
  ]);



  const value =
    useMemo(
      () => ({
        settings,

        isLoading:
          settingsQuery.isLoading,

        isError:
          settingsQuery.isError,

        refetch:
          settingsQuery.refetch,
      }),
      [
        settings,
        settingsQuery.isLoading,
        settingsQuery.isError,
        settingsQuery.refetch,
      ]
    );

  return (
    <SiteSettingsContext.Provider
      value={value}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings =
  () => {
    const context =
      useContext(
        SiteSettingsContext
      );

    if (!context) {
      throw new Error(
        "useSiteSettings yalnızca SiteSettingsProvider içinde kullanılabilir."
      );
    }

    return context;
  };
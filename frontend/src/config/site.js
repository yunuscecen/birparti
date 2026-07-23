export const siteConfig = {
  name: "BİR PARTİ",
  shortName: "Bir Parti",
  description: "Bu bir parti sitesi değil. Bu bir vicdan çağrısı.",
  email: "bilgi@birparti.com",

  primaryNavigation: [
    {
      label: "Ana Sayfa",
      path: "/",
      end: true,
    },
    {
      label: "Projelerimiz",
      path: "/projelerimiz",
    },
    {
      label: "Biz Kimiz",
      path: "/biz-kimiz",
    },
    {
      label: "Neye Karşıyız",
      path: "/neye-karsiyiz",
    },
    {
      label: "Blog",
      path: "/blog",
    },
    {
      label: "Forum",
      path: "/forum",
    },
    {
      label: "İletişim",
      path: "/iletisim",
    },
  ],

  auth: {
    loginLabel: "Giriş Yap",
    loginPath: "/giris",
    registerLabel: "Üye Ol",
    registerPath: "/kayit",
  },

  donation: {
    label: "Bir Damla Ol",
    path: "/bagis",
  },

  footer: {
    primaryText: "Bu bir parti sitesi değil.",
    secondaryText: "Bu bir vicdan çağrısı.",
    copyright: `© ${new Date().getFullYear()} BİR PARTİ | Tüm hakları saklıdır.`,
  },
};
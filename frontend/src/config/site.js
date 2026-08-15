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
    label: "Manifesto",
    path: "/manifesto",
  },
  {
    label: "Projeler",
    path: "/projelerimiz",
  },
  {
    label: "Yol Haritası",
    path: "/yol-haritasi",
  },
  {
    label: "Şeffaflık",
    path: "/seffaflik",
  },
  {
    label: "Blog",
    path: "/blog",
  },
  {
    label: "Topluluk",
    path: "/forum",
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

  provider: "Kreosus",

  creatorId: "6161",

  profileUrl:
    "https://kreosus.com/birparti",
},

  footer: {
    primaryText: "Bu bir parti sitesi değil.",
    secondaryText: "Bu bir vicdan çağrısı.",
    copyright: `© ${new Date().getFullYear()} BİR PARTİ | Tüm hakları saklıdır.`,
  },
};
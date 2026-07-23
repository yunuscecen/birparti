export const pageSeedData = [
  {
    slug: "biz-kimiz",
    eyebrow: "Bir Parti",
    title: "Biz Kimiz?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Yeni bir katılım, temsil ve toplumsal dayanışma anlayışı.",
    status: "published",

    sections: [
      {
        type: "text",
        title: "",
        sortOrder: 1,
        paragraphs: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

          "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",

          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.",

          "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum.",
        ],
      },
    ],

    seo: {
      title: "Biz Kimiz? | Bir Parti",
      description:
        "Bir Parti'nin yaklaşımı, katılım anlayışı ve temel değerleri.",
    },
  },

  {
    slug: "neye-karsiyiz",
    eyebrow: "Bir Parti",
    title: "Neye Karşıyız?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Toplumsal vicdanı, adaleti ve yaşam hakkını zedeleyen anlayışlara karşıyız.",
    status: "published",

    sections: [
      {
        type: "text",
        title: "",
        sortOrder: 1,
        paragraphs: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",

          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        ],
      },

      {
        type: "cards",
        title: "Karşı Durduğumuz Başlıklar",
        sortOrder: 2,

        cards: [
          {
            title: "Adalet ve Hukuk",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Hukukun üstünlüğünü zedeleyen ve adalete erişimi engelleyen her türlü anlayışa karşıyız.",
            linkLabel: "Devamını Oku",
            linkUrl: "/iletisim",
            sortOrder: 1,
          },
          {
            title: "Eğitim ve Gelecek",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Çocukların ve gençlerin geleceğini belirsizliğe sürükleyen sisteme karşıyız.",
            linkLabel: "Devamını Oku",
            linkUrl: "/projelerimiz",
            sortOrder: 2,
          },
          {
            title: "Ekonomi ve Emek",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Emeğin karşılığını alamadığı ve gelir adaletinin bozulduğu düzene karşıyız.",
            linkLabel: "Devamını Oku",
            linkUrl: "/projelerimiz",
            sortOrder: 3,
          },
          {
            title: "Yönetim ve Siyaset Ahlakı",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Kamu kaynaklarının denetimsiz ve şeffaflıktan uzak kullanılmasına karşıyız.",
            linkLabel: "Devamını Oku",
            linkUrl: "/projelerimiz",
            sortOrder: 4,
          },
          {
            title: "Toplumsal Vicdan ve Kutuplaşma",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. İnsanları ayrıştıran, dışlayan ve düşmanlaştıran siyasi dile karşıyız.",
            linkLabel: "Devamını Oku",
            linkUrl: "/iletisim",
            sortOrder: 5,
          },
          {
            title: "Yaşam Hakkı",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. İnsanların, hayvanların ve doğanın yaşam hakkını yok sayan anlayışa karşıyız.",
            linkLabel: "Devamını Oku",
            linkUrl: "/projelerimiz",
            sortOrder: 6,
          },
        ],
      },
    ],

    seo: {
      title: "Neye Karşıyız? | Bir Parti",
      description:
        "Bir Parti'nin karşı durduğu toplumsal, hukuki ve siyasi sorunlar.",
    },
  },
];
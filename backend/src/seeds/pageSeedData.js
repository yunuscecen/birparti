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
    {
    slug: "manifesto",
    eyebrow: "Bir Parti",
    title: "Manifesto",
    description:
      "Siyaseti yeniden güven, vicdan, katılım ve ortak sorumluluk temelinde kurmak için yola çıkıyoruz.",
    status: "published",

    sections: [
      {
        type: "text",
        title: "Başka Bir Siyaset Mümkün",
        sortOrder: 1,
        paragraphs: [
          "Bir Parti; siyasetin yalnızca seçim dönemlerinde hatırlanan bir temsil faaliyeti olmadığına inanır. Siyaset, insanların hayatına dokunan kararların açık, katılımcı ve hesap verebilir biçimde alınmasıdır.",

          "İnsanları ayrıştıran değil bir araya getiren, sorunları saklayan değil görünür kılan ve çözümü toplumla birlikte üreten bir anlayışı savunuyoruz.",

          "Hiçbir kişinin, makamın veya grubun ortak vicdanın üzerinde olmadığı; kaynakların şeffaf kullanıldığı ve her yurttaşın söz hakkına sahip olduğu bir yapı kurmayı hedefliyoruz.",
        ],
      },

      {
        type: "cards",
        title: "Temel İlkelerimiz",
        sortOrder: 2,

        cards: [
          {
            title: "Adalet",
            description:
              "Herkes için eşit hukuk, bağımsız yargı ve erişilebilir adalet.",
            linkLabel: "",
            linkUrl: "",
            sortOrder: 1,
          },
          {
            title: "Şeffaflık",
            description:
              "Kararların, gelirlerin ve harcamaların toplum tarafından izlenebilmesi.",
            linkLabel: "Şeffaflığı İncele",
            linkUrl: "/seffaflik",
            sortOrder: 2,
          },
          {
            title: "Katılım",
            description:
              "Yurttaşların yalnızca oy verirken değil karar süreçlerinde de söz sahibi olması.",
            linkLabel: "Topluluğa Katıl",
            linkUrl: "/forum",
            sortOrder: 3,
          },
          {
            title: "Dayanışma",
            description:
              "Kimsenin yalnız bırakılmadığı, ortak sorunların birlikte çözüldüğü bir toplum.",
            linkLabel: "",
            linkUrl: "",
            sortOrder: 4,
          },
        ],
      },
    ],

    seo: {
      title: "Manifesto | Bir Parti",
      description:
        "Bir Parti'nin temel ilkeleri, siyaset anlayışı ve ortak gelecek çağrısı.",
    },
  },

  {
    slug: "yol-haritasi",
    eyebrow: "Birlikte İlerliyoruz",
    title: "Yol Haritası",
    description:
      "Hedeflerimizi, çalışma aşamalarımızı ve ilerlememizi açık biçimde paylaşıyoruz.",
    status: "published",

    sections: [
      {
        type: "cards",
        title: "Çalışma Aşamalarımız",
        sortOrder: 1,

        cards: [
          {
            title: "1. Dinleme ve Hazırlık",
            description:
              "Toplumsal ihtiyaçları, yerel sorunları ve çözüm önerilerini doğrudan yurttaşlardan topluyoruz.",
            linkLabel: "Topluluğa Katıl",
            linkUrl: "/forum",
            sortOrder: 1,
          },
          {
            title: "2. Ortak Program",
            description:
              "Toplanan görüşleri uzmanlık, saha deneyimi ve açık tartışma süreçleriyle uygulanabilir politikalara dönüştürüyoruz.",
            linkLabel: "Projeleri İncele",
            linkUrl: "/projelerimiz",
            sortOrder: 2,
          },
          {
            title: "3. Yerel Yapılanma",
            description:
              "Yerelde hesap verebilir, katılımcı ve dayanışmayı büyüten çalışma grupları oluşturuyoruz.",
            linkLabel: "",
            linkUrl: "",
            sortOrder: 3,
          },
          {
            title: "4. Açık İlerleme",
            description:
              "Tamamlanan, devam eden ve planlanan çalışmaların durumunu düzenli olarak kamuoyuyla paylaşıyoruz.",
            linkLabel: "Şeffaflığı İncele",
            linkUrl: "/seffaflik",
            sortOrder: 4,
          },
        ],
      },
    ],

    seo: {
      title: "Yol Haritası | Bir Parti",
      description:
        "Bir Parti'nin hazırlık, katılım, program ve ilerleme aşamaları.",
    },
  },

  {
    slug: "seffaflik",
    eyebrow: "Açık ve Hesap Verebilir",
    title: "Şeffaflık",
    description:
      "Gelirlerimizi, harcamalarımızı, karar süreçlerimizi ve çalışma sonuçlarımızı toplumla paylaşmayı taahhüt ediyoruz.",
    status: "published",

    sections: [
      {
        type: "text",
        title: "Şeffaflık Taahhüdümüz",
        sortOrder: 1,
        paragraphs: [
          "Topluma ait kaynakların nasıl kullanıldığının toplum tarafından görülebilmesi gerektiğine inanıyoruz.",

          "Gelir ve harcama kayıtları, bağışların kullanım alanları, proje ilerlemeleri ve önemli kararlar düzenli olarak yayımlanacaktır.",
        ],
      },

      {
        type: "cards",
        title: "Açık Bilgi Alanları",
        sortOrder: 2,

        cards: [
          {
            title: "Gelirler",
            description:
              "Toplam gelirler ve gelir kaynakları dönemsel olarak açıklanacaktır.",
            linkLabel: "",
            linkUrl: "",
            sortOrder: 1,
          },
          {
            title: "Harcamalar",
            description:
              "Harcamaların tutarı, kategorisi ve kullanım amacı paylaşılacaktır.",
            linkLabel: "",
            linkUrl: "",
            sortOrder: 2,
          },
          {
            title: "Bağışlar",
            description:
              "Bağışların hangi çalışmalarda kullanıldığı açık biçimde gösterilecektir.",
            linkLabel: "Bir Damla Ol",
            linkUrl: "/bagis",
            sortOrder: 3,
          },
          {
            title: "Proje İlerlemesi",
            description:
              "Projelerin planlanan, devam eden ve tamamlanan aşamaları yayımlanacaktır.",
            linkLabel: "Projeleri İncele",
            linkUrl: "/projelerimiz",
            sortOrder: 4,
          },
        ],
      },
    ],

    seo: {
      title: "Şeffaflık | Bir Parti",
      description:
        "Bir Parti'nin gelir, harcama, bağış ve proje şeffaflığı yaklaşımı.",
    },
  },
];
export const projectCategorySeedData = [
  {
    name: "Eğitim",
    slug: "egitim",
    description: "Eğitim sistemi ve gelecek politikaları.",
    color: "#2453ad",
    sortOrder: 1,
  },
  {
    name: "Üretim",
    slug: "uretim",
    description: "Tarım, hayvancılık ve sürdürülebilir üretim.",
    color: "#56815b",
    sortOrder: 2,
  },
  {
    name: "Şeffaflık",
    slug: "seffaflik",
    description: "Kamu denetimi, yönetim ve şeffaflık.",
    color: "#304f9e",
    sortOrder: 3,
  },
  {
    name: "Güvenlik",
    slug: "guvenlik",
    description: "Yapı ve afet güvenliği politikaları.",
    color: "#b2466c",
    sortOrder: 4,
  },
  {
    name: "Sağlık",
    slug: "saglik",
    description: "Erişilebilir ve nitelikli sağlık sistemi.",
    color: "#277899",
    sortOrder: 5,
  },
  {
    name: "Ekonomi",
    slug: "ekonomi",
    description: "Ekonomi, emek ve çalışma hayatı.",
    color: "#bd7b20",
    sortOrder: 6,
  },
  {
    name: "Adalet",
    slug: "adalet",
    description: "Adalet ve temel hak politikaları.",
    color: "#b94b67",
    sortOrder: 7,
  },
  {
    name: "Yaşam",
    slug: "yasam",
    description: "Canlıların yaşam hakkı.",
    color: "#288397",
    sortOrder: 8,
  },
];

export const projectSeedData = [
  {
    title: "Eğitim Reformu",
    slug: "egitim-reformu",
    summary:
      "Eğitim sadece sınav kazandırmaz; hayata hazırlar. Ahlak, trafik, ilk yardım ve sosyal sorumluluk eğitim modelini savunuyoruz.",
    categorySlug: "egitim",
    coverImage: {
      url: "https://picsum.photos/seed/egitim-reformu/1200/800",
      alt: "Eğitim reformu projesi",
    },
    sections: [
      {
        heading: "Neden Eğitim Reformu?",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eğitim sistemi yalnızca akademik başarıya değil; yaşam becerilerine, etik değerlere ve toplumsal sorumluluğa da odaklanmalıdır.",
      },
      {
        heading: "Nasıl Uygulanacak?",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eğitim programlarının güncellenmesi, öğretmenlerin desteklenmesi ve öğrencilerin uygulamalı yaşam becerileri kazanması hedeflenmektedir.",
      },
    ],
    tags: ["eğitim", "gelecek", "reform"],
    isFeatured: true,
    sortOrder: 1,
  },
  {
    title: "Tarım ve Hayvancılık",
    slug: "tarim-ve-hayvancilik",
    summary:
      "Çiftçiye vergisiz mazot, gübre ve tohum. Alım garantili, planlı ve dijital tarım sistemi. Aracısız üretici modeli.",
    categorySlug: "uretim",
    coverImage: {
      url: "https://picsum.photos/seed/tarim-hayvancilik/1200/800",
      alt: "Tarım ve hayvancılık projesi",
    },
    sections: [
      {
        heading: "Üreticiyi Güçlendirmek",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Üreticilerin maliyetlerini azaltan ve üretim planlamasını güçlendiren sürdürülebilir bir model oluşturulacaktır.",
      },
      {
        heading: "Aracısız Üretim Modeli",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Üreticinin ürününü daha adil fiyatlarla doğrudan tüketiciye ulaştırabileceği dijital sistemler kurulacaktır.",
      },
    ],
    tags: ["tarım", "hayvancılık", "üretim"],
    isFeatured: true,
    sortOrder: 2,
  },
  {
    title: "Denetim ve Gözetim Bakanlığı",
    slug: "denetim-ve-gozetim-bakanligi",
    summary:
      "Devletin vicdanı. Tüm kamu harcamalarının, yapıların, sağlık ve eğitim sisteminin şeffaf denetimi.",
    categorySlug: "seffaflik",
    coverImage: {
      url: "https://picsum.photos/seed/denetim-gozetim/1200/800",
      alt: "Denetim ve gözetim projesi",
    },
    sections: [
      {
        heading: "Şeffaf Kamu Yönetimi",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Kamu kaynaklarının kullanımında herkes tarafından izlenebilir ve denetlenebilir bir yapı hedeflenmektedir.",
      },
      {
        heading: "Bağımsız Denetim",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Denetim süreçlerinin siyasi etkilerden uzak, bağımsız ve tarafsız şekilde yürütülmesi sağlanacaktır.",
      },
    ],
    tags: ["denetim", "şeffaflık", "kamu"],
    isFeatured: true,
    sortOrder: 3,
  },
  {
    title: "Yapı ve Deprem Güvenliği",
    slug: "yapi-ve-deprem-guvenligi",
    summary:
      "Deprem kader değildir. Her binanın temelden çatıya kadar dijital kayıtla takip edildiği güvenli yapı sistemi.",
    categorySlug: "guvenlik",
    coverImage: {
      url: "https://picsum.photos/seed/deprem-guvenligi/1200/800",
      alt: "Yapı ve deprem güvenliği projesi",
    },
    sections: [
      {
        heading: "Dijital Yapı Kimliği",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Yapıların malzeme, denetim ve bakım süreçleri tek bir dijital kayıt sistemi üzerinden takip edilecektir.",
      },
      {
        heading: "Bağımsız Yapı Denetimi",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Yapı denetim süreçleri şeffaflaştırılarak sorumluluk zinciri açık hale getirilecektir.",
      },
    ],
    tags: ["deprem", "yapı", "güvenlik"],
    sortOrder: 4,
  },
  {
    title: "Sağlık Sistemi Reformu",
    slug: "saglik-sistemi-reformu",
    summary:
      "Doktorlar hasta sayısıyla değil, tedavi kalitesiyle değerlendirilecek. Sağlık ocakları güçlendirilecek.",
    categorySlug: "saglik",
    coverImage: {
      url: "https://picsum.photos/seed/saglik-reformu/1200/800",
      alt: "Sağlık sistemi reformu projesi",
    },
    sections: [
      {
        heading: "Nitelikli Sağlık Hizmeti",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sağlık hizmetlerinde nicelik yerine tedavi kalitesi ve hasta memnuniyeti esas alınacaktır.",
      },
      {
        heading: "Koruyucu Sağlık Sistemi",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sağlık ocakları güçlendirilerek hastalık oluşmadan önce önleyici sağlık hizmetleri yaygınlaştırılacaktır.",
      },
    ],
    tags: ["sağlık", "doktor", "tedavi"],
    sortOrder: 5,
  },
  {
    title: "Ekonomi ve Çalışma Hayatı",
    slug: "ekonomi-ve-calisma-hayati",
    summary:
      "Asgari ücret, yaşam ücreti olmalıdır. Amaç yalnızca geliri artırmak değil, paranın alım gücünü artırmaktır.",
    categorySlug: "ekonomi",
    coverImage: {
      url: "https://picsum.photos/seed/ekonomi-calisma/1200/800",
      alt: "Ekonomi ve çalışma hayatı projesi",
    },
    sections: [
      {
        heading: "Yaşam Ücreti",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ücret politikalarının temel ihtiyaçlar ve gerçek yaşam maliyeti dikkate alınarak oluşturulması hedeflenmektedir.",
      },
      {
        heading: "Alım Gücünü Korumak",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ekonomi politikaları yalnızca nominal ücretlere değil, vatandaşın gerçek alım gücüne odaklanacaktır.",
      },
    ],
    tags: ["ekonomi", "emek", "çalışma"],
    sortOrder: 6,
  },
  {
    title: "Kadına Şiddetle Mücadele",
    slug: "kadina-siddetle-mucadele",
    summary:
      "Caydırıcı ve geri dönülmez cezalar. Elektronik takip, koruyucu ve önleyici mekanizmalar.",
    categorySlug: "adalet",
    coverImage: {
      url: "https://picsum.photos/seed/kadina-siddet/1200/800",
      alt: "Kadına şiddetle mücadele projesi",
    },
    sections: [
      {
        heading: "Önleyici Tedbirler",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risk altındaki kadınların hızlı ve etkin biçimde korunmasını sağlayacak mekanizmalar kurulacaktır.",
      },
      {
        heading: "Etkin Yargılama",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Şiddet vakalarının hızlı şekilde değerlendirilmesi ve caydırıcı yaptırımlar uygulanması hedeflenmektedir.",
      },
    ],
    tags: ["adalet", "kadın", "şiddet"],
    sortOrder: 7,
  },
  {
    title: "Milletvekili Ayrıcalıklarının Kaldırılması",
    slug: "milletvekili-ayricaliklarinin-kaldirilmasi",
    summary:
      "Milletvekilliği ayrıcalık değil, geçici bir kamu görevidir. Maaş, araç ve harcama süreçleri şeffaf olmalıdır.",
    categorySlug: "seffaflik",
    coverImage: {
      url: "https://picsum.photos/seed/milletvekili-ayricalik/1200/800",
      alt: "Milletvekili ayrıcalıklarının kaldırılması projesi",
    },
    sections: [
      {
        heading: "Kamu Görevi Anlayışı",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Milletvekilliğinin ayrıcalık değil, belirli süreyle üstlenilen bir kamu görevi olduğu anlayışı güçlendirilecektir.",
      },
      {
        heading: "Şeffaf Harcama Sistemi",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Milletvekillerine ilişkin kamu harcamaları açık ve denetlenebilir hale getirilecektir.",
      },
    ],
    tags: ["milletvekili", "şeffaflık", "kamu"],
    sortOrder: 8,
  },
  {
    title: "Hayvan Hakları",
    slug: "hayvan-haklari",
    summary:
      "Barınakların canlı izlenebilir olduğu, hayvanseverlerin sürece dahil edildiği sürdürülebilir sistem.",
    categorySlug: "yasam",
    coverImage: {
      url: "https://picsum.photos/seed/hayvan-haklari/1200/800",
      alt: "Hayvan hakları projesi",
    },
    sections: [
      {
        heading: "Yaşam Hakkı",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Hayvanların yaşam hakkını temel alan koruyucu ve sürdürülebilir politikalar uygulanacaktır.",
      },
      {
        heading: "Şeffaf Barınak Sistemi",
        body:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Barınakların denetlenebilir, izlenebilir ve gönüllü katılımına açık hale getirilmesi sağlanacaktır.",
      },
    ],
    tags: ["hayvan", "yaşam", "barınak"],
    sortOrder: 9,
  },
];
import mongoose from "mongoose";

const siteImageSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      publicId: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      alt: {
        type: String,
        trim: true,
        maxlength: 180,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const socialLinksSchema =
  new mongoose.Schema(
    {
      instagram: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      facebook: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      x: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      youtube: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      linkedin: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const siteSettingSchema =
  new mongoose.Schema(
    {
      key: {
        type: String,
        unique: true,
        immutable: true,
        index: true,
        default: "global",
      },
branding: {
  logo: {
    type: siteImageSchema,

    default: () => ({
      url: "",
      publicId: "",
      alt: "Bir Parti logosu",
    }),
  },

  favicon: {
    type: siteImageSchema,

    default: () => ({
      url: "",
      publicId: "",
      alt: "Bir Parti faviconu",
    }),
  },
},
      identity: {
        siteName: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
          default: "BİR PARTİ",
        },

        shortName: {
          type: String,
          required: true,
          trim: true,
          maxlength: 80,
          default: "Bir Parti",
        },

        description: {
          type: String,
          trim: true,
          maxlength: 500,
          default:
            "Bu bir parti sitesi değil. Bu bir vicdan çağrısı.",
        },
      },

      contact: {
        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          maxlength: 254,
          default:
            "bilgi@birparti.com",
        },

        phone: {
          type: String,
          trim: true,
          maxlength: 30,
          default: "",
        },

        address: {
          type: String,
          trim: true,
          maxlength: 500,
          default: "",
        },
      },

      footer: {
        primaryText: {
          type: String,
          trim: true,
          maxlength: 200,
          default:
            "Bu bir parti sitesi değil.",
        },

        secondaryText: {
          type: String,
          trim: true,
          maxlength: 200,
          default:
            "Bu bir vicdan çağrısı.",
        },

        copyrightText: {
          type: String,
          trim: true,
          maxlength: 200,
          default:
            "BİR PARTİ | Tüm hakları saklıdır.",
        },
      },

      socialLinks: {
        type: socialLinksSchema,

        default: () => ({
          instagram: "",
          facebook: "",
          x: "",
          youtube: "",
          linkedin: "",
        }),
      },

      features: {
        maintenanceMode: {
          type: Boolean,
          default: false,
        },

        registrationsEnabled: {
          type: Boolean,
          default: true,
        },

        forumEnabled: {
          type: Boolean,
          default: true,
        },
      },

      maintenanceMessage: {
        type: String,
        trim: true,
        maxlength: 500,
        default:
          "Sitemiz kısa süreli bir bakım çalışmasındadır.",
      },

      updatedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const SiteSetting =
  mongoose.model(
    "SiteSetting",
    siteSettingSchema
  );

export default SiteSetting;
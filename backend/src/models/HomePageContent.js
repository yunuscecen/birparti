import mongoose from "mongoose";

const buttonSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    _id: false,
  }
);

const featureCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1200,
  },

  buttonLabel: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },

  path: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },

  sortOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
});


const dynamicHomeSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    isEnabled: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
  }
);

const homePageContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "home",
      immutable: true,
      index: true,
    },

    hero: {
      eyebrow: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      titleFirst: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180,
      },

      titleSecond: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180,
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1200,
      },

      primaryButton: {
        type: buttonSchema,
        required: true,
      },

      secondaryButton: {
        type: buttonSchema,
        required: true,
      },
    },

    featureCards: {
      type: [featureCardSchema],
      default: [],
    },

    manifesto: {
      eyebrow: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 240,
      },

      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1500,
      },

      primaryButton: {
        type: buttonSchema,
        required: true,
      },

      secondaryButton: {
        type: buttonSchema,
        required: true,
      },
    },
schemaVersion: {
  type: Number,
  default: 1,
  min: 1,
},

sections: {
  type: [dynamicHomeSectionSchema],
  default: [],
},
    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 70,
        default: "",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 180,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const HomePageContent = mongoose.model(
  "HomePageContent",
  homePageContentSchema
);

export default HomePageContent;
import mongoose from "mongoose";

const forumTopicInteractionSchema =
  new mongoose.Schema(
    {
      topic: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "ForumTopic",
        required: true,
        index: true,
      },

      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /*
       * 1: olumlu oy
       * 0: oy kullanılmamış
       * -1: olumsuz oy
       */
      vote: {
        type: Number,
        enum: [-1, 0, 1],
        default: 0,
      },

      isSupported: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

forumTopicInteractionSchema.index(
  {
    topic: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

forumTopicInteractionSchema.index({
  topic: 1,
  vote: 1,
});

forumTopicInteractionSchema.index({
  topic: 1,
  isSupported: 1,
});

const ForumTopicInteraction =
  mongoose.model(
    "ForumTopicInteraction",
    forumTopicInteractionSchema
  );

export default ForumTopicInteraction;
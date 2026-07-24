import ForumNotification from "../models/ForumNotification.js";

const sameUser = (firstId, secondId) => {
  if (!firstId || !secondId) {
    return false;
  }

  return String(firstId) === String(secondId);
};

export const createForumNotification = async ({
  recipient,
  actor = null,
  type,
  topic = null,
  reply = null,
  report = null,
  title,
  message,
  link = "",
  uniqueKey = null,
}) => {
  if (!recipient) {
    return null;
  }

  /*
   * Kullanıcı kendi işlemi için bildirim almaz.
   */
  if (actor && sameUser(recipient, actor)) {
    return null;
  }

  const notificationData = {
    recipient,
    actor,
    type,
    topic,
    reply,
    report,
    title,
    message,
    link,
    uniqueKey,
    isRead: false,
    readAt: null,
  };

  try {
    if (uniqueKey) {
      return await ForumNotification.findOneAndUpdate(
        {
          uniqueKey,
        },
        {
          $setOnInsert: notificationData,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    return await ForumNotification.create(
      notificationData
    );
  } catch (error) {
    /*
     * Eş zamanlı iki işlem aynı uniqueKey ile
     * bildirim oluşturmaya çalışırsa uygulama
     * çökmesin.
     */
    if (error?.code === 11000) {
      return ForumNotification.findOne({
        uniqueKey,
      });
    }

    throw error;
  }
};

export default createForumNotification;
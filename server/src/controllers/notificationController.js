import Notification from "../models/Notification.js";

// ===== GET NOTIFICATIONS =====
export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;

    const userId = req.session?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const query = { recipient: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== MARK NOTIFICATION AS READ =====
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ message: "Marked as read.", notification });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== MARK AL LNOTIFICATIONS AS READ =====
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await Notification.updateMany(
      {
        recipient: userId,
        read: false,
      },
      { read: true }
    );

    return res
      .status(200)
      .json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== DELETE NOTIFICATIONS =====
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted." });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== CREATE NOTIFICATION =====
export const createNotification = async ({
  recipient,
  sender,
  type,
  targetType,
  targetId,
  message,
}) => {
  try {
    const moderationTypes = [
      "post_hidden",
      "post_reported",
      "post_restored",
      "post_deleted",
      "comment_hidden",
      "comment_reported",
      "comment_restored",
      "comment_deleted",
      "project_reported",
      "project_restored",
      "project_deleted",
    ];

    if (
      recipient.toString() === sender?.toString() &&
      !moderationTypes.includes(type)
    ) {
      return;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      targetType,
      targetId,
      message,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

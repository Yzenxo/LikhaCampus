import Notification from "../models/Notification.js";

const activeConnections = new Map();

// ===== SSE STREAM ENDPOINT =====
export const streamNotifications = (req, res) => {
  const userId = req.session?.userId || req.user?._id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log(`SSE connection established for user: ${userId}`);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.write(
    `data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`
  );

  activeConnections.set(userId.toString(), res);

  Notification.countDocuments({
    recipient: userId,
    read: false,
  })
    .then((unreadCount) => {
      res.write(
        `data: ${JSON.stringify({
          type: "unread_count",
          count: unreadCount,
        })}\n\n`
      );
    })
    .catch((err) => {
      console.error("Error fetching unread count:", err);
    });

  const keepAliveInterval = setInterval(() => {
    if (!activeConnections.has(userId.toString())) {
      clearInterval(keepAliveInterval);
      return;
    }
    res.write(`:ping\n\n`);
  }, 30000);

  req.on("close", () => {
    console.log(`SSE connection closed for user: ${userId}`);
    activeConnections.delete(userId.toString());
    clearInterval(keepAliveInterval);
    res.end();
  });
};

// ===== SEND NOTIFICATION TO USER (Helper Function) =====
export const sendNotificationToUser = (userId, notification) => {
  const connection = activeConnections.get(userId.toString());

  if (connection) {
    try {
      connection.write(
        `data: ${JSON.stringify({
          type: "notification",
          data: notification,
        })}\n\n`
      );

      console.log(`✅ Notification sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      activeConnections.delete(userId.toString());
      return false;
    }
  }

  console.log(`User ${userId} not connected to SSE`);
  return false;
};

// ===== SEND UNREAD COUNT UPDATE =====
export const sendUnreadCountUpdate = async (userId) => {
  const connection = activeConnections.get(userId.toString());

  if (connection) {
    try {
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        read: false,
      });

      connection.write(
        `data: ${JSON.stringify({
          type: "unread_count",
          count: unreadCount,
        })}\n\n`
      );

      return true;
    } catch (error) {
      console.error(`Error sending unread count to user ${userId}:`, error);
      return false;
    }
  }

  return false;
};

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

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    ).populate("sender", "firstName lastName avatar");

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Send updated unread count via SSE
    await sendUnreadCountUpdate(userId);

    return res.status(200).json({ message: "Marked as read.", notification });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== MARK ALL NOTIFICATIONS AS READ =====
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    await sendUnreadCountUpdate(userId);

    return res
      .status(200)
      .json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== DELETE NOTIFICATION =====
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await sendUnreadCountUpdate(userId);

    return res.status(200).json({ message: "Notification deleted." });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== CREATE NOTIFICATION (Updated to support SSE) =====
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
      "featured_artist",
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

    await notification.populate("sender", "firstName lastName avatar");

    const sent = sendNotificationToUser(recipient, notification);

    if (sent) {
      console.log(`Real-time notification sent to user ${recipient}`);
    } else {
      console.log(`Notification saved but user ${recipient} not connected`);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// ===== GET ACTIVE CONNECTIONS (Debug) =====
export const getActiveConnections = (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json({
    activeConnections: activeConnections.size,
    userIds: Array.from(activeConnections.keys()),
  });
};

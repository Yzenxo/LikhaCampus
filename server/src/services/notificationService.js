import { createNotification as createNotificationController } from "../controllers/notificationController.js";

/**
 * Notify user their post was auto-hidden
 */
export const notifyPostAutoHidden = async (userId, postId, reason) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "post_hidden",
      targetType: "ForumPost",
      targetId: postId,
      message:
        "Your post has been automatically hidden due to potential policy violations and is under review.",
    });
  } catch (error) {
    console.error("Error notifying post auto-hidden:", error);
  }
};

/**
 * Notify user their post was reported
 */
export const notifyPostReported = async (userId, postId, reason) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "post_reported",
      targetType: "ForumPost",
      targetId: postId,
      message: `Your post has been reported for "${reason}" and is under review by moderators.`,
    });
  } catch (error) {
    console.error("Error notifying post reported:", error);
  }
};

/**
 * Notify user their post was restored
 */
export const notifyPostRestored = async (userId, postId) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "post_restored",
      targetType: "ForumPost",
      targetId: postId,
      message:
        "Your post has been reviewed and restored. Thank you for your patience!",
    });
  } catch (error) {
    console.error("Error notifying post restored:", error);
  }
};

/**
 * Notify user their post was deleted
 */
export const notifyPostDeleted = async (userId, postId, reason) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "post_deleted",
      targetType: "ForumPost",
      targetId: postId,
      message: `Your post has been permanently removed for violating community guidelines: ${reason}`,
    });
  } catch (error) {
    console.error("Error notifying post deleted:", error);
  }
};

// Similar functions for comments
export const notifyCommentAutoHidden = async (
  userId,
  commentId,
  postId,
  reason
) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "comment_hidden",
      targetType: "Comment",
      targetId: commentId,
      message:
        "Your comment has been automatically hidden due to potential policy violations and is under review.",
    });
  } catch (error) {
    console.error("Error notifying comment auto-hidden:", error);
  }
};

export const notifyCommentReported = async (
  userId,
  commentId,
  postId,
  reason
) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "comment_reported",
      targetType: "Comment",
      targetId: commentId,
      message: `Your comment has been reported for "${reason}" and is under review by moderators.`,
    });
  } catch (error) {
    console.error("Error notifying comment reported:", error);
  }
};

export const notifyCommentRestored = async (userId, commentId, postId) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "comment_restored",
      targetType: "Comment",
      targetId: commentId,
      message: "Your comment has been reviewed and restored.",
    });
  } catch (error) {
    console.error("Error notifying comment restored:", error);
  }
};

export const notifyCommentDeleted = async (
  userId,
  commentId,
  postId,
  reason
) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "comment_deleted",
      targetType: "Comment",
      targetId: commentId,
      message: `Your comment has been removed for violating community guidelines: ${reason}`,
    });
  } catch (error) {
    console.error("Error notifying comment deleted:", error);
  }
};

/**
 * Notify user their project was reported
 */
export const notifyProjectReported = async (userId, projectId, reason) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "project_reported",
      targetType: "Project",
      targetId: projectId,
      message: `Your project has been reported for "${reason}" and is under review by moderators.`,
    });
  } catch (error) {
    console.error("Error notifying project reported:", error);
  }
};

/**
 * Notify user their project was restored
 */
export const notifyProjectRestored = async (userId, projectId) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "project_restored",
      targetType: "Project",
      targetId: projectId,
      message:
        "Your project has been reviewed and restored. Thank you for your patience!",
    });
  } catch (error) {
    console.error("Error notifying project restored:", error);
  }
};

/**
 * Notify user their project was deleted
 */
export const notifyProjectDeleted = async (userId, projectId, reason) => {
  try {
    return await createNotificationController({
      recipient: userId,
      sender: userId, // Self-notification for moderation
      type: "project_deleted",
      targetType: "Project",
      targetId: projectId,
      message: `Your project has been permanently removed for violating community guidelines: ${reason}`,
    });
  } catch (error) {
    console.error("Error notifying project deleted:", error);
  }
};

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      enum: [
        "comment",
        "upvote",
        "announcement",
        "project_tag",
        "reply",
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
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: [
        "ForumPost",
        "Project",
        "Comment",
        "Announcement",
        "Featured Artist",
      ],
      required: false,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);

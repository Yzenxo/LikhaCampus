import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skill: { type: String, required: true },
    category: { type: String, required: true },
    taggedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        caption: String,
        order: Number,
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        publicId: String,
        thumbnail: String,
        caption: String,
        order: Number,
      },
    ],
    thumbnail: {
      type: String,
      default: function () {
        return this.images[0]?.url || this.videos[0]?.thumbnail || null;
      },
    },
    moderation: {
      status: {
        type: String,
        enum: ["active", "reported", "hidden", "deleted"],
        default: "active",
      },
      reports: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: String,
          details: String,
          reportedAt: { type: Date, default: Date.now },
        },
      ],
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);

import mongoose from "mongoose";

const ForumPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvoteCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    moderation: {
      status: {
        type: String,
        enum: ["active", "hidden", "under_review", "deleted"],
        default: "active",
      },
      toxicityScore: { type: Number, default: 0 },
      autoFlagged: { type: Boolean, default: false },
      flagReason: String,
      reports: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: String,
          details: { type: String },
          reportedAt: { type: Date, default: Date.now },
        },
      ],
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
    },
  },
  { timestamps: true }
);

ForumPostSchema.pre("save", function (next) {
  if (this.isModified("upvotes")) {
    this.upvoteCount = this.upvotes.length;
  }
  next();
});

ForumPostSchema.index({ upvoteCount: -1 });
ForumPostSchema.index({ commentCount: -1 });
ForumPostSchema.index({ createdAt: -1 });
ForumPostSchema.index({ "moderation.status": 1 });

export default mongoose.model("ForumPost", ForumPostSchema);

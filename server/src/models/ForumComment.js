import mongoose from "mongoose";

const ForumCommentSchema = new mongoose.Schema({
  content: { type: String, required: true },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    required: true,
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumComment",
    default: null,
  },
  replyCount: { type: Number, default: 0 },

  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  upvoteCount: { type: Number, default: 0 },

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
        details: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ForumCommentSchema.virtual("replies", {
  ref: "ForumComment",
  localField: "_id",
  foreignField: "parentComment",
});

ForumCommentSchema.set("toJSON", { virtuals: true });
ForumCommentSchema.set("toObject", { virtuals: true });

ForumCommentSchema.post("save", async function (doc) {
  if (!doc.isDeleted && doc.moderation.status === "active") {
    if (doc.parentComment) {
      await mongoose
        .model("ForumComment")
        .findByIdAndUpdate(doc.parentComment, { $inc: { replyCount: 1 } });
    } else {
      await mongoose.model("ForumPost").findByIdAndUpdate(doc.post, {
        $inc: { commentCount: 1 },
      });
    }
  }
});

ForumCommentSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && this.getUpdate().$set?.isDeleted === true) {
    await mongoose.model("ForumPost").findByIdAndUpdate(doc.post, {
      $inc: { commentCount: -1 },
    });
  }
});

ForumCommentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    if (doc.parentComment) {
      await mongoose
        .model("ForumComment")
        .findByIdAndUpdate(doc.parentComment, {
          $inc: { replyCount: -1 },
        });
    } else {
      await mongoose.model("ForumPost").findByIdAndUpdate(doc.post, {
        $inc: { commentCount: -1 },
      });

      await mongoose
        .model("ForumComment")
        .deleteMany({ parentComment: doc._id });
    }
  }
});

export default mongoose.model("ForumComment", ForumCommentSchema);

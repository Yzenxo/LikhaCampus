import ForumComment from "../models/ForumComment.js";
import ForumPost from "../models/ForumPost.js";
import {
  moderateComment,
  moderatePost,
} from "../services/moderationService.js";
import {
  notifyCommentAutoHidden,
  notifyCommentDeleted,
  notifyCommentReported,
  notifyCommentRestored,
  notifyPostAutoHidden,
  notifyPostDeleted,
  notifyPostReported,
  notifyPostRestored,
} from "../services/notificationService.js";
import { createNotification } from "./notificationController.js";

// ===== CREATE POST =====
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const moderationResult = await moderatePost(title, content);

    const post = new ForumPost({
      title,
      content,
      author: req.session.userId,
      moderation: {
        status: moderationResult.shouldHide ? "hidden" : "active",
        toxicityScore: moderationResult.toxicityScore,
        autoFlagged: moderationResult.shouldHide,
        flagReason: moderationResult.flagReason || null,
      },
    });

    await post.save();
    await post.populate("author", "firstName lastName avatar username");

    if (moderationResult.shouldHide) {
      await notifyPostAutoHidden(
        req.session.userId,
        post._id,
        moderationResult.flagReason
      );

      return res.status(201).json({
        ...post.toObject(),
        moderationWarning: "Your post is under review due to content policy",
      });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET POSTS (WITH PAGINATION FOR INFINITE SCROLL) =====
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { sortBy = "recent" } = req.query;
    const isAdmin = req.session.user?.role === "admin";

    const moderationFilter = isAdmin ? {} : { "moderation.status": "active" };

    let posts;
    let sortQuery = {};

    switch (sortBy) {
      case "trending":
        posts = await ForumPost.aggregate([
          { $match: moderationFilter },
          {
            $addFields: {
              trendingScore: {
                $divide: [
                  {
                    $add: [
                      { $multiply: ["$upvoteCount", 2] },
                      { $multiply: ["$commentCount", 3] },
                    ],
                  },
                  {
                    $add: [
                      {
                        $divide: [
                          { $subtract: [new Date(), "$createdAt"] },
                          3600000,
                        ],
                      },
                      2,
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { trendingScore: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);

        await ForumPost.populate(posts, {
          path: "author",
          select: "firstName lastName avatar username",
        });
        break;

      case "upvotes":
        sortQuery = { upvoteCount: -1, createdAt: -1 };
        posts = await ForumPost.find(moderationFilter)
          .sort(sortQuery)
          .populate("author", "firstName lastName avatar username")
          .skip(skip)
          .limit(limit);
        break;

      case "comments":
        sortQuery = { commentCount: -1, createdAt: -1 };
        posts = await ForumPost.find(moderationFilter)
          .sort(sortQuery)
          .populate("author", "firstName lastName avatar username")
          .skip(skip)
          .limit(limit);
        break;

      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        posts = await ForumPost.find(moderationFilter)
          .sort(sortQuery)
          .populate("author", "firstName lastName avatar username")
          .skip(skip)
          .limit(limit);
        break;
    }

    const totalCount = await ForumPost.countDocuments(moderationFilter);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalPosts: totalCount,
        hasMore: skip + posts.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET USER POSTS =====
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const isAdmin = req.session.user?.role === "admin";
    const isOwnProfile = req.session.userId === userId;

    const moderationFilter =
      isAdmin || isOwnProfile
        ? { author: userId }
        : { author: userId, "moderation.status": "active" };

    const posts = await ForumPost.find(moderationFilter)
      .sort({ createdAt: -1 })
      .populate("author", "firstName lastName avatar username");

    res.json({ posts, total: posts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== DELETE POST =====
export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const isAdmin = req.session.user?.role === "admin";
    const isAuthor = post.author.toString() === req.session.userId;

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ error: "You can only delete your own posts." });
    }

    await ForumComment.deleteMany({ post: req.params.id });
    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== TOGGLE UPVOTE =====
export const toggleUpvote = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to upvote." });
    }

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.moderation?.status && post.moderation.status !== "active") {
      return res.status(403).json({ error: "This post is not available." });
    }

    const hasUpvoted = post.upvotes.includes(userId);
    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
    } else {
      post.upvotes.push(userId);

      await createNotification({
        recipient: post.author,
        sender: userId,
        type: "upvote",
        targetType: "ForumPost",
        targetId: postId,
        message: "upvoted your post",
      });
    }

    await post.save();

    res.json({ upvotes: post.upvoteCount, hasUpvoted: !hasUpvoted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== GET COMMENTS (FILTER HIDDEN) =====
export const getComments = async (req, res) => {
  try {
    const isAdmin = req.session.user?.role === "admin";

    const moderationFilter = isAdmin ? {} : { "moderation.status": "active" };

    const comments = await ForumComment.find({
      post: req.params.id,
      parentComment: null,
      ...moderationFilter,
    })
      .populate("author", "firstName lastName avatar username")
      .populate({
        path: "replies",
        match: moderationFilter,
        options: { sort: { createdAt: 1 }, limit: 3 },
        populate: {
          path: "author",
          select: "firstName lastName avatar username",
        },
      })
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== ADD COMMENT WITH MODERATION =====
export const addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await ForumComment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found." });
      }
    }

    const moderationResult = await moderateComment(content.trim());

    const comment = new ForumComment({
      post: req.params.id,
      content: content.trim(),
      author: req.session.userId,
      parentComment: parentCommentId || null,
      moderation: {
        status: moderationResult.shouldHide ? "hidden" : "active",
        toxicityScore: moderationResult.toxicityScore,
        autoFlagged: moderationResult.shouldHide,
        flagReason: moderationResult.flagReason || null,
      },
    });

    await comment.save();
    await comment.populate("author", "firstName lastName avatar username");

    if (moderationResult.shouldHide) {
      await notifyCommentAutoHidden(
        req.session.userId,
        comment._id,
        req.params.id,
        moderationResult.flagReason
      );

      return res.status(201).json({
        ...comment.toObject(),
        moderationWarning: "Your comment is under review due to content policy",
      });
    }

    const recipientId = parentComment ? parentComment.author : post.author;
    if (recipientId.toString() !== req.session.userId) {
      await createNotification({
        recipient: recipientId,
        sender: req.session.userId,
        type: parentCommentId ? "reply" : "comment",
        targetType: "ForumPost",
        targetId: req.params.id,
        message: parentComment
          ? "replied to your comment"
          : "commented on your post",
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== EDIT COMMENT WITH MODERATION =====
export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    const comment = await ForumComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    if (comment.author.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own comments." });
    }

    const moderationResult = await moderateComment(content.trim());

    comment.content = content.trim();
    comment.updatedAt = Date.now();
    comment.moderation.toxicityScore = moderationResult.toxicityScore;

    if (moderationResult.shouldHide) {
      comment.moderation.status = "hidden";
      comment.moderation.autoFlagged = true;
      comment.moderation.flagReason = moderationResult.flagReason;

      await comment.save();
      await comment.populate("author", "firstName lastName avatar username");

      await notifyCommentAutoHidden(
        req.session.userId,
        comment._id,
        comment.post,
        moderationResult.flagReason
      );

      return res.json({
        message: "Comment updated but is under review due to content policy",
        comment,
      });
    }

    await comment.save();
    await comment.populate("author", "firstName lastName avatar username");

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET REPLIES (FILTER HIDDEN) =====
export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { skip = 0, limit = 10 } = req.query;
    const isAdmin = req.session.user?.role === "admin";

    const moderationFilter = isAdmin
      ? { parentComment: commentId }
      : { parentComment: commentId, "moderation.status": "active" };

    const replies = await ForumComment.find(moderationFilter)
      .populate("author", "firstName lastName avatar username")
      .sort({ createdAt: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await ForumComment.countDocuments(moderationFilter);

    res.json({
      replies,
      total,
      hasMore: parseInt(skip) + replies.length < total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== EDIT POST WITH MODERATION =====
export const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.session.userId;

    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const moderationResult = await moderatePost(title, content);

    post.title = title;
    post.content = content;
    post.updatedAt = Date.now();
    post.moderation.toxicityScore = moderationResult.toxicityScore;

    if (moderationResult.shouldHide) {
      post.moderation.status = "hidden";
      post.moderation.autoFlagged = true;
      post.moderation.flagReason = moderationResult.flagReason;

      await post.save();
      await post.populate("author", "firstName lastName username avatar");

      await notifyPostAutoHidden(userId, post._id, moderationResult.flagReason);

      return res.json({
        message: "Post updated but is under review due to content policy",
        post,
      });
    }

    await post.save();
    await post.populate("author", "firstName lastName username avatar");

    res.json({
      message: "Post updated successfully",
      post: post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post." });
  }
};

// ===== DELETE COMMENT =====
export const deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    const isAdmin = req.session.user?.role === "admin";
    const isAuthor = comment.author.toString() === req.session.userId;

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments." });
    }

    await ForumComment.findByIdAndDelete(req.params.commentId);

    res.json({
      message: "Comment deleted successfully!",
      wasReply: !!comment.parentComment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========================================
// MODERATION FUNCTIONS
// ========================================

// ===== REPORT POST =====
export const reportPost = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyReported = post.moderation.reports.some(
      (report) => report.userId.toString() === req.session.userId
    );

    if (alreadyReported) {
      return res
        .status(400)
        .json({ error: "You have already reported this post" });
    }

    post.moderation.reports.push({
      userId: req.session.userId,
      reason: reason || "No reason provided",
      details: details || "",
    });

    if (post.moderation.status === "active") {
      post.moderation.status = "under_review";
    }

    await post.save();

    await notifyPostReported(post.author, post._id, reason);

    res.json({ message: "Post reported successfully" });
  } catch (error) {
    console.error("Report post error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== REPORT COMMENT =====
export const reportComment = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const comment = await ForumComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const alreadyReported = comment.moderation.reports.some(
      (report) => report.userId.toString() === req.session.userId
    );

    if (alreadyReported) {
      return res
        .status(400)
        .json({ error: "You have already reported this comment" });
    }

    comment.moderation.reports.push({
      userId: req.session.userId,
      reason: reason || "No reason provided",
      details: details || "",
      reportedAt: new Date(),
    });

    if (comment.moderation.status === "active") {
      comment.moderation.status = "under_review";
    }

    await comment.save();

    await notifyCommentReported(
      comment.author,
      comment._id,
      comment.post,
      reason
    );

    res.json({ message: "Comment reported successfully" });
  } catch (error) {
    console.error("Report comment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ADMIN: GET FLAGGED CONTENT =====
export const getFlaggedContent = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const flaggedPosts = await ForumPost.find({
      "moderation.status": { $in: ["hidden", "under_review"] },
    })
      .populate("author", "firstName lastName username email avatar")
      .populate("moderation.reports.userId", "firstName lastName username")
      .populate("moderation.reviewedBy", "firstName lastName username")
      .sort({ createdAt: -1 })
      .lean();

    const flaggedComments = await ForumComment.find({
      "moderation.status": { $in: ["hidden", "under_review"] },
    })
      .populate("author", "firstName lastName username email avatar")
      .populate("post", "title")
      .populate("moderation.reports.userId", "firstName lastName username")
      .populate("moderation.reviewedBy", "firstName lastName username")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      posts: flaggedPosts,
      comments: flaggedComments,
    });
  } catch (error) {
    console.error("Get flagged content error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ADMIN: RESTORE POST =====
export const restorePost = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.moderation.status = "active";
    post.moderation.reviewedBy = req.session.userId;
    post.moderation.reviewedAt = new Date();

    await post.save();

    await notifyPostRestored(post.author, post._id);

    res.json({ message: "Post restored successfully", post });
  } catch (error) {
    console.error("Restore post error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ADMIN: DELETE POST PERMANENTLY =====
export const permanentDeletePost = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { reason } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const authorId = post.author;

    await notifyPostDeleted(
      authorId,
      post._id,
      reason || "Violation of community guidelines"
    );

    await ForumComment.deleteMany({ post: req.params.id });

    await ForumPost.findByIdAndDelete(req.params.id);

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted permanently" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ADMIN: RESTORE COMMENT =====
export const restoreComment = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const comment = await ForumComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.moderation.status = "active";
    comment.moderation.reviewedBy = req.session.userId;
    comment.moderation.reviewedAt = new Date();

    await comment.save();

    await notifyCommentRestored(comment.author, comment._id, comment.post);

    res.json({ message: "Comment restored successfully", comment });
  } catch (error) {
    console.error("Restore comment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ADMIN: DELETE COMMENT PERMANENTLY =====
export const permanentDeleteComment = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { reason } = req.body;
    const comment = await ForumComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const authorId = comment.author;
    const postId = comment.post;

    await notifyCommentDeleted(
      authorId,
      comment._id,
      postId,
      reason || "Violation of community guidelines"
    );

    await ForumComment.findByIdAndDelete(req.params.commentId);

    await ForumComment.findByIdAndDelete(req.params.commentId);

    res.json({ message: "Comment deleted permanently" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: error.message });
  }
};

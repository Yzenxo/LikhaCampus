import express from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  editComment,
  editPost,
  getComments,
  getFlaggedContent,
  getPosts,
  getReplies,
  getUserPosts,
  permanentDeleteComment,
  permanentDeletePost,
  reportComment,
  reportPost,
  restoreComment,
  restorePost,
  toggleUpvote,
} from "../controllers/forumController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { commentSchema, postSchema } from "../validators/forumValidators.js";

const router = express.Router();

router.use(requireAuth);
router.get("/posts", getPosts);
router.get("/posts/user/:userId", getUserPosts);
router.post("/posts", validate(postSchema), createPost);
router.delete("/posts/:id", deletePost);
router.post("/posts/:id/upvote", toggleUpvote);
router.get("/posts/:id/comments", getComments);
router.post("/posts/:id/comments", validate(commentSchema), addComment);
router.patch("/posts/:id", validate(postSchema), editPost);
router.delete("/posts/:id/comments/:commentId", deleteComment);

router.get("/comments/:commentId/replies", getReplies);
router.put("/comments/:commentId", validate(commentSchema), editComment);

router.post("/posts/:id/report", reportPost);
router.post("/comments/:commentId/report", reportComment);

router.use(requireAdmin);
router.get("/admin/flagged", requireAdmin, getFlaggedContent);
router.post("/admin/posts/:id/restore", requireAdmin, restorePost);
router.delete("/admin/posts/:id/delete", requireAdmin, permanentDeletePost);
router.post("/admin/comments/:commentId/restore", requireAdmin, restoreComment);
router.delete(
  "/admin/comments/:commentId/delete",
  requireAdmin,
  permanentDeleteComment
);

export default router;

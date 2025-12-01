import express from "express";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
  streamNotifications,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/stream", streamNotifications);
router.get("/", requireAuth, getNotifications);
router.patch("/:id/read", requireAuth, markAsRead);
router.patch("/read-all", requireAuth, markAllAsRead);
router.delete("/:id", requireAuth, deleteNotification);

export default router;

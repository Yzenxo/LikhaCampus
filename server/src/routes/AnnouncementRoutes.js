import express from "express";
import { uploadAnnouncement } from "../config/cloudinary.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getAllAnnouncements);
router.get("/:id", getAnnouncement);

router.use(requireAdmin);
router.post("/", uploadAnnouncement.single("image"), createAnnouncement);
router.put("/:id", uploadAnnouncement.single("image"), updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;

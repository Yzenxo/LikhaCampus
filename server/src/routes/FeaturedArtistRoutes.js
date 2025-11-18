import express from "express";
import {
  checkIfFeatured,
  getCurrent,
  getHistory,
  manualSelect,
} from "../controllers/featuredArtistController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/current", getCurrent);
router.get("/history", getHistory);
router.get("/check/:userId", checkIfFeatured);
router.post("/select", requireAdmin, manualSelect);

export default router;

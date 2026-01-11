import express from "express";
import {
  checkIfFeatured,
  createSnapshot,
  getCurrent,
  getHistory,
  getTopMonthly,
  getTopWeekly,
  manualSelect,
} from "../controllers/featuredArtistController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/current", getCurrent);
router.get("/history", getHistory);
router.post("/create-snapshot", createSnapshot);
router.get("/top-weekly", getTopWeekly);
router.get("/top-monthly", getTopMonthly);
router.get("/check/:userId", checkIfFeatured);
router.post("/select", requireAdmin, manualSelect);

export default router;

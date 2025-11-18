import express from "express";
import {
  getTopContributors,
  getUserContributionsStats,
} from "../controllers/contributionsController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAdmin);
router.get("/stats", getUserContributionsStats);
router.get("/top-contributors", getTopContributors);

export default router;

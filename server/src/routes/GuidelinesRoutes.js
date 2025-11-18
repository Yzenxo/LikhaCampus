import express from "express";
import {
  createGuideline,
  deleteGuideline,
  getActiveGuidelines,
  getAllGuidelines,
  getGuidelineById,
  reorderGuidelines,
  updateGuideline,
} from "../controllers/guidelinesController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/active", getActiveGuidelines);

router.use(requireAdmin);
router.get("/", getAllGuidelines);
router.get("/:id", getGuidelineById);
router.post("/", createGuideline);
router.put("/:id", updateGuideline);
router.delete("/:id", deleteGuideline);
router.post("/reorder", reorderGuidelines);

export default router;

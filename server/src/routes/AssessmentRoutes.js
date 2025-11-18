import express from "express";
import {
  deleteAssessment,
  getAssessment,
  saveAssessment,
} from "../controllers/assessmentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.post("/", saveAssessment);
router.delete("/", deleteAssessment);
router.get("/:userId", getAssessment);
router.get("/", getAssessment);

export default router;

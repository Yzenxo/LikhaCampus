import express from "express";
import {
  approveCategoryRequest,
  createCategoryRequest,
  getAllCategoryRequests,
  getApprovedCategories,
  rejectCategoryRequest,
} from "../controllers/categoryRequestController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.use(requireAuth);
router.post("/", createCategoryRequest);
router.get("/approved", getApprovedCategories);

// Admin routes
router.use(requireAdmin);
router.get("/", getAllCategoryRequests);
router.put("/:id/approve", approveCategoryRequest);
router.put("/:id/reject", rejectCategoryRequest);

export default router;

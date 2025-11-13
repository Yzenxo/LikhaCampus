import express from "express";
import { getPublicStats } from "../controllers/homeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getPublicStats);

export default router;

import express from "express";
import {
  dismissUserReports,
  getAllProjects,
  getAllUsers,
  getDashboardStats,
  getReportedUsers,
  getSemesterSettings,
  takeActionOnUser,
  updateSemesterSettings,
  updateUserRole,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/settings/semester", getSemesterSettings);

router.use(requireAdmin);
router.get("/stats", getDashboardStats);
router.get("/projects", getAllProjects);
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.put("/settings/semester", updateSemesterSettings);
router.get("/reported-users", getReportedUsers);
router.post("/users/:userId/dismiss-reports", dismissUserReports);
router.post("/users/:userId/take-action", takeActionOnUser);

export default router;

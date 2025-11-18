import express from "express";
import multer from "multer";
import {
  archiveProject,
  deleteProject,
  deleteReportedProject,
  editProject,
  getArchivedProjects,
  getProjectById,
  getProjects,
  getReportedProjects,
  getTaggedProjects,
  getUserProjects,
  reportProject,
  restoreProject,
  restoreReportedProject,
  uploadProject,
} from "../controllers/projectController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { projectSchema } from "../validators/projectValidators.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const extractTaggedUsers = (req, res, next) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const match = body.match(/name="taggedUsers"\r?\n\r?\n(.*?)\r?\n/);
    if (match) {
      req.extractedTaggedUsers = match[1];
    }
  });
  next();
};

router.get("/user/:userId", getUserProjects);

// Admin routes
router.get("/admin/reported", requireAdmin, getReportedProjects);
router.post("/admin/:projectId/restore", requireAdmin, restoreReportedProject);
router.delete("/admin/:projectId/delete", requireAdmin, deleteReportedProject);

router.use(requireAuth);
router.post("/:projectId/report", reportProject);

router.post("/", extractTaggedUsers, upload.array("files", 4), uploadProject);
router.get("/", getProjects);

// Archives
router.get("/archived", getArchivedProjects);
router.get("/tagged/:userId", getTaggedProjects);
router.patch("/:id/", upload.any(), validate(projectSchema), editProject);
router.patch("/:id/archive", archiveProject);
router.patch("/:id/restore", restoreProject);

router.get("/:id", getProjectById);
router.delete("/:id", deleteProject);

export default router;

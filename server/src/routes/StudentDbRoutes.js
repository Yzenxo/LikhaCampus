import express from "express";
import multer from "multer";
import {
  getAllStudents,
  getStudentCount,
  uploadStudentDatabase,
} from "../controllers/studentDbController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
    }
  },
});

router.post(
  "/upload-students",
  upload.single("excelFile"),
  uploadStudentDatabase
);
router.get("/students-count", getStudentCount);
router.get("/students", getAllStudents);

export default router;

import express from "express";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "../controllers/forgotPasswordController.js";

const router = express.Router();

router.post("/forgot-password", requestPasswordReset);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);

export default router;

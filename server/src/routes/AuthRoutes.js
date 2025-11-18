import express from "express";
import { uploadRegistrationForm } from "../config/cloudinary.js";
import {
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/emailController.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  reVerifyUser,
} from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/userValidators.js";

const router = express.Router();

router.post(
  "/register",
  uploadRegistrationForm.single("registrationForm"),
  registerUser
);
router.post("/login", validate(loginSchema), loginUser);
router.post(
  "/reverify",
  uploadRegistrationForm.single("registrationForm"),
  reVerifyUser
);
router.post("/logout", logoutUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

export default router;

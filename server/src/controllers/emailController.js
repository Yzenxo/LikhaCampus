import crypto from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "../services/emailService.js";

// ===== VERIFY EMAIL =====
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required." });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired verification link. Please request a new one.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      message: "Email verified successfully! You can now log in.",
      success: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== RESEND VERIFICATION EMAIL =====
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message:
          "If an account exists with that email, a verification link has been sent.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "This email is already verified. Please log in.",
      });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    const emailResult = await sendVerificationEmail(
      email,
      user.firstName,
      emailVerificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to resend verification email:", emailResult.error);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.json({
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

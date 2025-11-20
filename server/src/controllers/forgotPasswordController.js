import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";

// ===== REQUEST PASSWORD RESET =====
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailContent = {
      to: user.email,
      subject: "Password Reset Request - LikhaCampus",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #00017a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #00017a; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button-content {color: white;}
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName},</p>
              <p>You requested to reset your LikhaCampus password.</p>
              <p>Click the button below to create a new password:</p>

              <a href="${resetUrl}" class="button"><p class="button-content">Reset Password</p></a>

              <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
            <div class="footer">
              <p>LikhaCampus - Connect. Create. Aspire. Transform.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sendEmail(emailContent);

    res.status(200).json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      message: "Error processing password reset request. Please try again.",
    });
  }
};

// ===== REQUEST PASSWORD =====
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    const confirmationEmail = {
      to: user.email,
      subject: "Password Successfully Reset - LikhaCampus",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #00017a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello ${user.firstName},</p>
              <p>Your password has been successfully reset.</p>
              <p>You can now log in to LikhaCampus with your new password.</p>
              <p>If you didn't make this change, please contact us immediately.</p>
              <div class="footer">
                <p>© 2025 LikhaCampus - Connect. Create. Aspire. Transform.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sendEmail(confirmationEmail);

    res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      message: "Error resetting password. Please try again.",
    });
  }
};

// ===== VERIFY RESET TOKEN =====
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired token",
      });
    }

    res.status(200).json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      valid: false,
      message: "Error verifying token",
    });
  }
};

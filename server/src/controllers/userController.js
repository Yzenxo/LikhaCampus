import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import AdminSettings from "../models/AdminSettings.js";
import ForumComment from "../models/ForumComment.js";
import ForumPost from "../models/ForumPost.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import StudentDatabase from "../models/StudentDatabase.js";
import User from "../models/User.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { extractRegistrationFormInfo } from "../services/ocrServices.js";

dotenv.config();

// ===== REGISTER ACCOUNT =====
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      studentNumber,
      yearLevel,
      program,
      password,
    } = req.body;

    const registrationForm = req.file;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !studentNumber ||
      !yearLevel ||
      !program ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!registrationForm) {
      return res
        .status(400)
        .json({ message: "Registration form (PDF) is required." });
    }

    if (password.length < 8) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    console.log("Extracting information from registration form...");
    const pdfExtraction = await extractRegistrationFormInfo(
      registrationForm.path
    );

    if (!pdfExtraction.success) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: pdfExtraction.message,
        extractedText: pdfExtraction.extractedText,
      });
    }

    console.log("PDF extraction successful!");

    const adminSettings = await AdminSettings.getSettings();

    if (pdfExtraction.academicYear !== adminSettings.currentAcademicYear) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: `Registration form is for ${pdfExtraction.academicYear}, but we are currently accepting ${adminSettings.currentAcademicYear}. Please upload your current academic year registration form.`,
      });
    }

    if (pdfExtraction.semester !== adminSettings.currentSemester) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: `Registration form is for ${pdfExtraction.semester}, but we are currently accepting ${adminSettings.currentSemester}. Please upload your current semester registration form.`,
      });
    }

    const studentRecord = await StudentDatabase.findOne({
      firstName: { $regex: new RegExp(`^${firstName.trim()}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName.trim()}$`, "i") },
      studentNumber: studentNumber.trim(),
      yearLevel: yearLevel,
    });

    if (!studentRecord) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }

      console.log("Student validation failed - not found in masterlist");
      return res.status(400).json({
        message:
          "Student information does not match our records. Please verify your first name, last name, student number, and year level match the official enrollment records.",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({ message: "Email already registered." });
    }

    const studentExists = await User.findOne({ studentNumber });
    if (studentExists) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res
        .status(400)
        .json({ message: "Student number already registered." });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({ message: "Username already taken." });
    }

    const hash = await bcrypt.hash(password, 10);

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      studentNumber,
      yearLevel,
      program,
      password: hash,
      avatar: {
        url:
          process.env.DEFAULT_AVATAR_URL ||
          "https://res.cloudinary.com/dycptvzqk/image/upload/v1760758084/default_avatar_kglgnn.jpg",
        publicId: null,
      },
      registrationFormPath: {
        url: registrationForm.path,
        publicId: registrationForm.filename,
      },

      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,

      registrationFormVerified: true,
      registrationSemester: pdfExtraction.semester,
      registrationAcademicYear: pdfExtraction.academicYear,

      isVerified: true,
      verificationDate: new Date(),
    });

    await user.save();

    console.log("User created successfully!");

    const emailResult = await sendVerificationEmail(
      email,
      firstName,
      emailVerificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    console.log("Registration complete!");

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account before logging in.",
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Registration error: ", error);

    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, {
          resource_type: "raw",
        });
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const MAX_LOGIN_ATTEMPTS = 5;
const BASE_LOCK_TIME = 15 * 60 * 1000; // 15 minutes base

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // ===== FIX CORRUPTED OR EXPIRED LOCK =====
    if (
      user.lockUntil &&
      (isNaN(new Date(user.lockUntil).getTime()) ||
        user.lockUntil <= Date.now())
    ) {
      user.lockUntil = undefined;
      user.loginAttempts = 0;
      user.lockCount = 0;
      await user.save({ validateBeforeSave: false });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Too many attempts. Please try again in ${minutesLeft} minute(s).`,
      });
    }

    if (user.isSuspended) {
      return res
        .status(403)
        .json({ message: `Account suspended: ${user.suspensionReason}` });
    }

    if (user.isBanned) {
      return res
        .status(403)
        .json({ message: `Account banned: ${user.banReason}` });
    }

    if (user.isSuspended) {
      const now = new Date();
      const suspensionEnd = new Date(user.suspensionDate);
      suspensionEnd.setHours(
        suspensionEnd.getHours() + user.suspensionDuration
      );

      if (now >= suspensionEnd) {
        // Lift suspension automatically
        user.isSuspended = false;
        user.suspensionReason = "";
        user.suspensionDate = null;
        user.suspensionDuration = 0;
        await user.save();
      } else {
        throw new Error(
          `Account temporarily suspended until ${suspensionEnd.toLocaleString()}`
        );
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Exponential backoff
        const lockMultiplier = Math.min(Math.pow(2, user.lockCount || 0), 8);
        const newLockTime = BASE_LOCK_TIME * lockMultiplier;
        const finalLockTime = Math.min(newLockTime, 24 * 60 * 60 * 1000);

        user.lockUntil = new Date(Date.now() + finalLockTime);
        user.loginAttempts = 0;
        user.lockCount = (user.lockCount || 0) + 1;
        await user.save({ validateBeforeSave: false });

        const minutes = Math.ceil(finalLockTime / 60000);
        return res.status(423).json({
          message: `Too many failed login attempts. Account locked for ${minutes} minute(s).`,
        });
      }

      await user.save({ validateBeforeSave: false });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return res.status(401).json({
        message: `Invalid credentials. ${attemptsLeft} attempt(s) remaining.`,
      });
    }

    // Reset attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lockCount = 0;
    await user.save({ validateBeforeSave: false });

    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
    };

    req.session.save((err) => {
      if (err) return res.status(500).json({ error: "Session save failed." });

      res.json({ message: "Login successful!", user: req.session.user });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// ===== GET PUBLIC PROFILE (NO AUTH REQUIRED) =====
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: new RegExp(`^${username}$`, "i"),
      isDeactivated: false,
    }).select(
      "-password -email -studentNumber -registrationFormPath -emailVerificationToken -loginAttempts -lockUntil -lockCount -emailVerificationExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const projects = await Project.find({
      author: user._id,
      isArchived: false,
    })
      .populate("author", "firstName lastName username avatar")
      .sort({ createdAt: -1 });

    const forumPostsCount = await ForumPost.countDocuments({
      author: user._id,
    });

    res.json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        headerColor: user.headerColor,
        yearLevel: user.yearLevel,
        createdAt: user.createdAt,
        hasAssessment: user.hasAssessment,
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ===== LOGOUT ACCOUNT =====
export const logoutUser = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed." });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully." });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== REPORT USER =====
export const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, details } = req.body;
    const reporterId = req.session.userId;

    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    if (userId === reporterId) {
      return res.status(400).json({ error: "You cannot report yourself" });
    }

    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingReport = reportedUser.reports.find(
      (r) => r.reportedBy.toString() === reporterId && r.status === "pending"
    );

    if (existingReport) {
      return res.status(400).json({
        error: "You have already reported this user",
      });
    }

    reportedUser.reports.push({
      reportedBy: reporterId,
      reason,
      details: details || "",
      reportedAt: new Date(),
      status: "pending",
    });

    await reportedUser.save();

    const pendingReports = reportedUser.reports.filter(
      (r) => r.status === "pending"
    );

    console.log(
      `User ${reportedUser.username} reported. Total pending reports: ${pendingReports.length}`
    );

    res.json({
      message: "User reported successfully",
      reportsCount: pendingReports.length,
    });
  } catch (error) {
    console.error("Report user error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// ===== DEACTIVATE ACCOUNT =====
export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isDeactivated) {
      return res
        .status(400)
        .json({ message: "Account is already deactivated." });
    }

    user.isDeactivated = true;
    user.deactivatedAt = new Date();
    await user.save();

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
    });

    res.json({
      message:
        "Account deactivated successfully. You have 15 days to reactivate before permanent deletion.",
    });
  } catch (error) {
    console.error("Deactivation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== REACTIVATE ACCOUNT =====
export const reactivateAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isDeactivated) {
      return res.status(400).json({ message: "Account is not deactivated." });
    }

    const daysSinceDeactivation =
      (Date.now() - user.deactivatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDeactivation > 15) {
      return res.status(410).json({
        message: "Account has been permanently deleted. Cannot reactivate.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    user.isDeactivated = false;
    user.deactivatedAt = null;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lockCount = 0;
    await user.save();

    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
    };

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Session save failed." });
      }

      res.json({
        message: "Account reactivated successfully!",
        user: req.session.user,
      });
    });
  } catch (error) {
    console.error("Reactivation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE ACCOUNT PERMANENTLY =====
export const deleteAccountPermanently = async (req, res) => {
  try {
    const userId = req.params.userId || req.session.userId;
    const isAdmin = req.session.user?.role === "admin";

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    if (userId !== req.session.userId && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const projects = await Project.find({ author: userId });
    console.log(`Found ${projects.length} projects to delete`);

    for (const project of projects) {
      for (const image of project.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
          } catch (err) {
            console.log(`Failed to delete image: ${image.publicId}`);
          }
        }
      }
      for (const video of project.videos) {
        if (video.publicId) {
          try {
            await cloudinary.uploader.destroy(video.publicId, {
              resource_type: "video",
            });
          } catch (err) {
            console.log(`Failed to delete video: ${video.publicId}`);
          }
        }
      }
    }

    await Project.deleteMany({ author: userId });

    const posts = await ForumPost.find({ author: userId });

    for (const post of posts) {
      await ForumComment.deleteMany({ post: post._id });
    }
    await ForumPost.deleteMany({ author: userId });

    await ForumComment.deleteMany({ author: userId });

    if (user.avatar?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      } catch (err) {
        console.log(`Failed to delete avatar: ${user.avatar.publicId}`);
      }
    }

    await Notification.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }],
    });

    if (user.registrationFormPath?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.registrationFormPath.publicId, {
          resource_type: "raw",
        });
      } catch (err) {
        console.log(
          `Failed to delete registration form: ${user.registrationFormPath.publicId}`
        );
      }
    }

    await User.findByIdAndDelete(userId);

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
    });

    res.json({
      message: "Account and all associated data permanently deleted.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== RE-VERIFY USER (UPLOAD NEW REGISTRATION FORM) =====
export const reVerifyUser = async (req, res) => {
  try {
    const userId = req.session.userId;
    const registrationForm = req.file;
    const { yearLevel } = req.body; // ADD THIS

    if (!registrationForm) {
      return res.status(400).json({
        message: "Registration form (PDF) is required.",
      });
    }

    // ADD THIS VALIDATION
    if (!yearLevel) {
      return res.status(400).json({
        message: "Year level is required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const pdfExtraction = await extractRegistrationFormInfo(
      registrationForm.path
    );

    if (!pdfExtraction.success) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: pdfExtraction.message,
        extractedText: pdfExtraction.extractedText,
      });
    }

    const adminSettings = await AdminSettings.getSettings();

    if (pdfExtraction.academicYear !== adminSettings.currentAcademicYear) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: `Registration form must be for ${adminSettings.currentAcademicYear}.`,
      });
    }

    if (pdfExtraction.semester !== adminSettings.currentSemester) {
      if (registrationForm.filename) {
        await cloudinary.uploader.destroy(registrationForm.filename, {
          resource_type: "raw",
        });
      }
      return res.status(400).json({
        message: `Registration form must be for ${adminSettings.currentSemester}.`,
      });
    }

    if (user.registrationFormPath?.publicId) {
      await cloudinary.uploader.destroy(user.registrationFormPath.publicId, {
        resource_type: "raw",
      });
    }

    user.registrationFormPath = {
      url: registrationForm.path,
      publicId: registrationForm.filename,
    };
    user.registrationSemester = pdfExtraction.semester;
    user.registrationAcademicYear = pdfExtraction.academicYear;
    user.registrationFormVerified = true;
    user.needsReVerification = false;
    user.reVerificationReason = "";
    user.yearLevel = yearLevel; // ADD THIS - Update the year level

    await user.save();

    res.json({
      message: "Re-verification successful! You can now access the platform.",
      user: {
        needsReVerification: false,
        registrationSemester: user.registrationSemester,
        registrationAcademicYear: user.registrationAcademicYear,
        yearLevel: user.yearLevel, // ADD THIS to response
      },
    });
  } catch (error) {
    console.error("Re-verification error:", error);

    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, {
          resource_type: "raw",
        });
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

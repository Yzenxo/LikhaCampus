import AdminSettings from "../models/AdminSettings.js";
import ForumPost from "../models/ForumPost.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

// ===== GET ALL USERS =====
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ===== GET SITE STATS =====
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalProjects = await Project.countDocuments(
      { isArchived: false },
      { "moderation.status": "active" }
    );
    const totalPosts = await ForumPost.countDocuments({
      "moderation.status": "active",
    });

    res.json({
      stats: {
        totalUsers,
        totalProjects,
        totalPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats: ", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

// ===== GET ALL PROJECTS =====
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isArchived: false })
      .populate("author", "firstName lastName username email avatar")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects: ", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// ===== GET ALL REPORTED PROJECTS =====
export const getReportedProjects = async (req, res) => {
  try {
    const reportedProjects = await Project.find({
      "moderation.status": { $in: ["reported", "hidden"] },
      isArchived: false,
    })
      .populate("author", "firstName lastName username email avatar")
      .populate("moderation.reports.userId", "firstName lastName username")
      .sort({ "moderation.reports.0.reportedAt": -1 });

    res.json({ projects: reportedProjects });
  } catch (error) {
    console.error("Error fetching reported projects:", error);
    res.status(500).json({ error: "Failed to fetch reported projects" });
  }
};

// ===== RESTORE DELETED PROJECT =====
export const restoreProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        "moderation.status": "active",
        "moderation.reviewedBy": req.session.userId,
        "moderation.reviewedAt": new Date(),
        $unset: { "moderation.reports": "" },
      },
      { new: true }
    ).populate("author", "firstName lastName username avatar");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project restored successfully", project });
  } catch (error) {
    console.error("Error restoring project:", error);
    res.status(500).json({ error: "Failed to restore project" });
  }
};

// ===== DELETE REPORTED PROJECT =====
export const deleteReportedProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        "moderation.status": "deleted",
        isArchived: true,
        "moderation.reviewedBy": req.session.userId,
        "moderation.reviewedAt": new Date(),
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully", project });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// ===== GET CURRENT SEMESTER SETTINGS =====
export const getSemesterSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    res.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE SEMESTER SETTINGS (ADMIN ONLY) =====
export const updateSemesterSettings = async (req, res) => {
  try {
    if (req.session.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const { currentAcademicYear, currentSemester } = req.body;

    if (!currentAcademicYear || !currentSemester) {
      return res.status(400).json({
        message: "Academic year and semester are required.",
      });
    }

    if (!["First Semester", "Second Semester"].includes(currentSemester)) {
      return res.status(400).json({
        message: 'Semester must be "First Semester" or "Second Semester".',
      });
    }

    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(currentAcademicYear)) {
      return res.status(400).json({
        message: "Academic year must be in format YYYY-YYYY (e.g., 2024-2025).",
      });
    }

    let settings = await AdminSettings.findOne();

    const isChanging =
      !settings ||
      settings.currentAcademicYear !== currentAcademicYear ||
      settings.currentSemester !== currentSemester;

    // ===== CHECK IF ACADEMIC YEAR CHANGED =====
    const academicYearChanged =
      settings &&
      settings.currentAcademicYear &&
      settings.currentAcademicYear !== currentAcademicYear;

    if (!settings) {
      settings = new AdminSettings({
        currentAcademicYear,
        currentSemester,
        lastUpdatedBy: req.session.userId,
      });
    } else {
      settings.currentAcademicYear = currentAcademicYear;
      settings.currentSemester = currentSemester;
      settings.lastUpdatedBy = req.session.userId;
    }

    await settings.save();

    // ===== AUTO-INCREMENT YEAR LEVELS IF ACADEMIC YEAR CHANGED =====
    let promotionStats = { promoted: 0, graduated: 0 };
    if (academicYearChanged) {
      console.log("🎓 Academic year changed! Promoting students...");

      // Get all non-alumni users
      const users = await User.find({
        isAlumni: { $ne: true },
        isVerified: true,
        role: "user",
      });

      for (const user of users) {
        const currentYear = user.yearLevel;

        switch (currentYear) {
          case "1st Year":
            user.yearLevel = "2nd Year";
            promotionStats.promoted++;
            break;
          case "2nd Year":
            user.yearLevel = "3rd Year";
            promotionStats.promoted++;
            break;
          case "3rd Year":
            user.yearLevel = "4th Year";
            promotionStats.promoted++;
            break;
          case "4th Year":
            // Mark as alumni
            user.isAlumni = true;
            user.graduationDate = new Date();
            promotionStats.graduated++;
            break;
        }

        await user.save();
      }

      console.log(
        `✅ Year level progression complete: ${promotionStats.promoted} students promoted, ${promotionStats.graduated} students graduated`
      );
    }

    // ===== FLAG ALL USERS FOR RE-VERIFICATION =====
    if (isChanging) {
      const updateResult = await User.updateMany(
        { role: "user" },
        {
          $set: {
            needsReVerification: true,
            reVerificationReason: `New semester: ${currentAcademicYear} - ${currentSemester}`,
            registrationFormVerified: false,
          },
        }
      );

      console.log(
        `Flagged ${updateResult.modifiedCount} users for re-verification`
      );
    }

    console.log(`Semester settings updated by admin ${req.session.userId}:`, {
      academicYear: currentAcademicYear,
      semester: currentSemester,
    });

    // Build response message
    let message = "Semester settings updated successfully!";
    if (academicYearChanged) {
      message = `Academic year changed! ${promotionStats.promoted} students promoted to next year level, ${promotionStats.graduated} students graduated. All users flagged for re-verification.`;
    } else if (isChanging) {
      message =
        "Semester settings updated! All users flagged for re-verification.";
    }

    res.json({
      message,
      settings,
      usersAffected: isChanging
        ? await User.countDocuments({ role: "user" })
        : 0,
      ...(academicYearChanged && {
        promotion: {
          promoted: promotionStats.promoted,
          graduated: promotionStats.graduated,
        },
      }),
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== UPDATE USER ROLES =====
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (req.session.userId === userId) {
      return res.status(403).json({ error: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error("Error updating user role: ", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// ===== GET REPORTED USERS (3+ pending reports) =====
export const getReportedUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { "reports.status": "pending" },
        { warnings: { $exists: true, $not: { $size: 0 } } },
        { isSuspended: true },
        { isBanned: true },
      ],
    }).populate("reports.reportedBy", "firstName lastName username");

    res.json({ users });
  } catch (error) {
    console.error("Error fetching violation users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== DISMISS USER REPORTS =====
export const dismissUserReports = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.reports.forEach((report) => {
      if (report.status === "pending") {
        report.status = "dismissed";
      }
    });

    await user.save();

    console.log(`Reports dismissed for user: ${user.username}`);

    res.json({ message: "Reports dismissed successfully" });
  } catch (error) {
    console.error("Error dismissing reports:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// ===== TAKE ACTION ON USER =====
export const takeActionOnUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;

    if (!action || !reason) {
      return res.status(400).json({ error: "Action and reason are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.reports.forEach((report) => {
      if (report.status === "pending") {
        report.status = "reviewed";
      }
    });

    switch (action) {
      case "warning":
        console.log(`⚠️ Warning issued to ${user.username}: ${reason}`);
        user.warnings = user.warnings || [];
        user.warnings.push({
          reason,
          date: new Date(),
          admin: req.session.userId,
        });
        break;

      case "suspend":
        const durationHours = req.body.duration || 24;
        user.isSuspended = true;
        user.suspensionReason = reason;
        user.suspensionDate = new Date();
        user.suspensionDuration = durationHours;
        console.log(`⏸️ Account suspended: ${user.username}`);
        break;

      case "ban":
        user.isBanned = true;
        user.banReason = reason;
        user.banDate = new Date();
        console.log(`⛔ Account permanently banned: ${user.username}`);
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await user.save();

    res.json({
      message: `Action '${action}' taken successfully`,
      action,
      reason,
      userStatus: {
        isSuspended: user.isSuspended || false,
        isBanned: user.isBanned || false,
      },
    });
  } catch (error) {
    console.error("Error taking action:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isSuspended = false;
    user.suspensionReason = "";
    user.suspensionDate = null;
    user.suspensionDuration = null;

    await user.save();
    res.json({ message: "User has been un-suspended" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to un-suspend user" });
  }
};

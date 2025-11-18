import Project from "../models/Project.js";
import User from "../models/User.js";

// ===== GET PUBLIC STATS (TOTAL USERS & TOTAL PROJECTS) =====
export const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: { $ne: "admin" },
      isDeleted: { $ne: false },
    });
    const totalProjects = await Project.countDocuments({ isArchived: false });

    res.json({
      stats: {
        totalUsers,
        totalProjects,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats: ", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

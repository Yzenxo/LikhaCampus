import ForumPost from "../models/ForumPost.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

// ===== GET ALL USER CONTRIBUTIONS =====
export const getUserContributionsStats = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "firstName lastName email username role avatar createdAt lastActive isBanned"
      )
      .lean();

    const projectCounts = await Project.aggregate([
      {
        $match: {
          isArchived: false,
          "moderation.status": "active",
        },
      },
      {
        $group: {
          _id: "$author",
          projectCount: { $sum: 1 },
        },
      },
    ]);

    const forumPostCounts = await ForumPost.aggregate([
      {
        $match: {
          "moderation.status": { $ne: "hidden" },
        },
      },
      {
        $group: {
          _id: "$author",
          postCount: { $sum: 1 },
        },
      },
    ]);

    const projectCountMap = {};
    projectCounts.forEach((item) => {
      projectCountMap[item._id.toString()] = item.projectCount;
    });

    const forumPostCountMap = {};
    forumPostCounts.forEach((item) => {
      forumPostCountMap[item._id.toString()] = item.postCount;
    });

    const usersWithStats = users.map((user) => {
      const projectCount = projectCountMap[user._id.toString()] || 0;
      const forumPostCount = forumPostCountMap[user._id.toString()] || 0;
      const totalActivity = projectCount + forumPostCount;

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        isBanned: user.isBanned,
        stats: {
          projectCount,
          forumPostCount,
          totalActivity,
        },
      };
    });

    const totalProjects = projectCounts.reduce(
      (sum, item) => sum + item.projectCount,
      0
    );
    const totalPosts = forumPostCounts.reduce(
      (sum, item) => sum + item.postCount,
      0
    );
    const activeUsers = users.filter((u) => !u.isBanned).length;
    const avgProjectsPerUser =
      users.length > 0 ? Math.round(totalProjects / users.length) : 0;

    res.json({
      users: usersWithStats,
      platformStats: {
        totalUsers: users.length,
        activeUsers,
        totalProjects,
        totalPosts,
        avgProjectsPerUser,
      },
    });
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    res.status(500).json({ error: "Failed to fetch user contributions" });
  }
};

// ===== GET TOP CONTRIBUTIONS =====
export const getTopContributors = async (req, res) => {
  try {
    const { limit = 10, sortBy = "projects" } = req.query;

    const projectCounts = await Project.aggregate([
      {
        $match: {
          isArchived: false,
          "moderation.status": "active",
        },
      },
      {
        $group: {
          _id: "$author",
          projectCount: { $sum: 1 },
        },
      },
      {
        $sort: { projectCount: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const forumPostCounts = await ForumPost.aggregate([
      {
        $match: {
          "moderation.status": { $ne: "hidden" },
        },
      },
      {
        $group: {
          _id: "$author",
          postCount: { $sum: 1 },
        },
      },
      {
        $sort: { postCount: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const topProjectUserIds = projectCounts.map((item) => item._id);
    const topProjectUsers = await User.find({
      _id: { $in: topProjectUserIds },
    }).select("firstName lastName username avatar");

    const topForumUserIds = forumPostCounts.map((item) => item._id);
    const topForumUsers = await User.find({
      _id: { $in: topForumUserIds },
    }).select("firstName lastName username avatar");

    const topProjectContributors = projectCounts.map((item) => {
      const user = topProjectUsers.find(
        (u) => u._id.toString() === item._id.toString()
      );
      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatar: user.avatar,
        },
        projectCount: item.projectCount,
      };
    });

    const topForumContributors = forumPostCounts.map((item) => {
      const user = topForumUsers.find(
        (u) => u._id.toString() === item._id.toString()
      );
      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatar: user.avatar,
        },
        postCount: item.postCount,
      };
    });

    res.json({
      topProjectContributors,
      topForumContributors,
    });
  } catch (error) {
    console.error("Error fetching top contributors:", error);
    res.status(500).json({ error: "Failed to fetch top contributors" });
  }
};

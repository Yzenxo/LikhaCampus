import { createNotification } from "../controllers/notificationController.js";
import FeaturedArtist from "../models/FeaturedArtist.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

/**
 * Get the start and end date for the current week (Monday to Sunday)
 */
const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days since Monday (if today is Sunday, it's 6 days since Monday)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Get Monday of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { startDate: monday, endDate: sunday };
};

/**
 * Get week number of the year
 */
const getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

/**
 * Check if user is eligible to be featured
 * Must not have been featured in the last 30 days
 */
const isEligible = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentFeatured = await FeaturedArtist.findOne({
    user: userId,
    startDate: { $gte: thirtyDaysAgo },
  });

  return !recentFeatured;
};

/**
 * Get top contributors (users with most projects)
 */
const getTopContributors = async () => {
  try {
    // Aggregate projects by author and count
    const topContributors = await Project.aggregate([
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
          latestProject: { $max: "$createdAt" },
        },
      },
      {
        $match: {
          projectCount: { $gte: 1 }, // Must have at least 1 project
        },
      },
      {
        $sort: {
          projectCount: -1,
          latestProject: -1, // Tiebreaker: most recent project
        },
      },
      {
        $limit: 50, // Get top 50 to check eligibility
      },
    ]);

    return topContributors;
  } catch (error) {
    console.error("Error getting top contributors:", error);
    return [];
  }
};

/**
 * Select featured artist for the current week
 */
export const selectFeaturedArtist = async () => {
  try {
    const { startDate, endDate } = getCurrentWeekDates();
    const week = getWeekNumber(startDate);
    const year = startDate.getFullYear();

    // Check if we already have a featured artist for this week
    const existingFeatured = await FeaturedArtist.findOne({
      week,
      year,
    }).populate("user", "firstName lastName avatar username bio");

    if (existingFeatured) {
      console.log(
        "Featured artist already exists for this week:",
        existingFeatured.user.username
      );
      return existingFeatured;
    }

    // Get top contributors
    const topContributors = await getTopContributors();

    if (topContributors.length === 0) {
      console.log("No eligible contributors found");
      return null;
    }

    // Find first eligible user
    let selectedUser = null;
    let projectCount = 0;

    for (const contributor of topContributors) {
      const eligible = await isEligible(contributor._id);

      if (eligible) {
        // Check if user still exists and is active
        const user = await User.findById(contributor._id);

        if (user && !user.isBanned) {
          selectedUser = contributor._id;
          projectCount = contributor.projectCount;
          break;
        }
      }
    }

    if (!selectedUser) {
      console.log(
        "No eligible users found (all featured within last 30 days or inactive)"
      );
      return null;
    }

    const featuredArtist = new FeaturedArtist({
      user: selectedUser,
      projectCount: projectCount,
      startDate: startDate,
      endDate: endDate,
      week: week,
      year: year,
    });

    await featuredArtist.save();

    // Populate user data
    await featuredArtist.populate(
      "user",
      "firstName lastName avatar username bio"
    );

    // Send notification to the featured artist
    await createNotification({
      recipient: selectedUser,
      type: "featured_artist",
      message: "You've been selected as Featured Artist of the Week!",
    });

    return featuredArtist;
  } catch (error) {
    console.error("Error selecting featured artist:", error);
    throw error;
  }
};

/**
 * Get current featured artist
 */
export const getCurrentFeaturedArtist = async () => {
  try {
    const now = new Date();

    const featuredArtist = await FeaturedArtist.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("user", "firstName lastName avatar username bio")
      .sort({ startDate: -1 });

    return featuredArtist;
  } catch (error) {
    console.error("Error getting current featured artist:", error);
    return null;
  }
};

/**
 * Get featured artist history
 */
export const getFeaturedArtistHistory = async (limit = 10) => {
  try {
    const history = await FeaturedArtist.find()
      .populate("user", "firstName lastName avatar username bio")
      .sort({ startDate: -1 })
      .limit(limit);

    return history;
  } catch (error) {
    console.error("Error getting featured artist history:", error);
    return [];
  }
};

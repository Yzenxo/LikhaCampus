import FeaturedArtist from "../models/FeaturedArtist.js";
import Project from "../models/Project.js";
import TopArtistsSnapshot from "../models/TopArtistsSnapshot.js";
import User from "../models/User.js";
import {
  notifyFeaturedArtist,
  notifyTopArtist,
} from "./notificationService.js";

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
 * ===== NEW: GET TOP 3 ARTISTS BY UPVOTES (WEEKLY OR MONTHLY) =====
 * This calculates rankings in real-time (used for snapshot creation)
 */
const calculateTopArtistsByUpvotes = async (timeframe = "week") => {
  try {
    const now = new Date();

    // Aggregate projects by author and sum their upvotes within the timeframe
    const topArtists = await Project.aggregate([
      {
        $match: {
          isArchived: false,
          "moderation.status": "active",
        },
      },
      {
        $group: {
          _id: "$author",
          totalUpvotes: { $sum: "$upvoteCount" },
          projectCount: { $sum: 1 },
        },
      },
      {
        $match: {
          totalUpvotes: { $gt: 0 }, // Must have at least 1 upvote
        },
      },
      { $sort: { totalUpvotes: -1, projectCount: -1 } },
      { $limit: 3 }, // Top 3 only
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.isBanned": { $ne: true }, // Exclude banned users
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          user: {
            _id: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            username: "$user.username",
            avatar: "$user.avatar",
            bio: "$user.bio",
          },
          totalUpvotes: 1,
          projectCount: 1,
        },
      },
    ]);

    return topArtists;
  } catch (error) {
    console.error(`Error calculating top artists (${timeframe}):`, error);
    return [];
  }
};

/**
 * ===== CREATE SNAPSHOT OF TOP 3 ARTISTS =====
 */
export const createTopArtistsSnapshot = async (timeframe = "week") => {
  try {
    const now = new Date();
    let startDate, endDate, period;

    if (timeframe === "week") {
      // Get current week dates
      const { startDate: weekStart, endDate: weekEnd } = getCurrentWeekDates();
      startDate = weekStart;
      endDate = weekEnd;

      const week = getWeekNumber(startDate);
      const year = startDate.getFullYear();
      period = `${year}-W${String(week).padStart(2, "0")}`;
    } else if (timeframe === "month") {
      // Get current month dates
      const year = now.getFullYear();
      const month = now.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      period = `${year}-${String(month + 1).padStart(2, "0")}`;
    }

    // Check if snapshot already exists for this period
    const existingSnapshot = await TopArtistsSnapshot.findOne({
      timeframe,
      period,
    });

    if (existingSnapshot) {
      console.log(`Snapshot already exists for ${timeframe} ${period}`);
      return existingSnapshot;
    }

    // Calculate top artists
    const topArtists = await calculateTopArtistsByUpvotes(timeframe);

    if (topArtists.length === 0) {
      console.log(`No artists found for ${timeframe} snapshot`);
      return null;
    }

    // Create rankings array
    const rankings = topArtists.map((artist, index) => ({
      rank: index + 1,
      user: artist.userId,
      totalUpvotes: artist.totalUpvotes,
      projectCount: artist.projectCount,
    }));

    // Create snapshot
    const snapshot = await TopArtistsSnapshot.create({
      timeframe,
      period,
      startDate,
      endDate,
      rankings,
    });

    await snapshot.populate(
      "rankings.user",
      "firstName lastName username avatar bio"
    );

    console.log(`✅ Created ${timeframe} snapshot for period ${period}`);
    console.log(
      `   Top artist: ${topArtists[0].user.username} (${topArtists[0].totalUpvotes} upvotes)`
    );

    return snapshot;
  } catch (error) {
    console.error(`Error creating ${timeframe} snapshot:`, error);
    throw error;
  }
};

/**
 * ===== GET CURRENT TOP 3 ARTISTS (FROM SNAPSHOT) =====
 */
export const getTopArtistsByUpvotes = async (timeframe = "week") => {
  try {
    const now = new Date();

    // Find the most recent snapshot for this timeframe
    const snapshot = await TopArtistsSnapshot.findOne({
      timeframe,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("rankings.user", "firstName lastName username avatar bio")
      .sort({ startDate: -1 });

    if (!snapshot) {
      console.log(
        `No snapshot found for current ${timeframe}, creating one...`
      );
      const newSnapshot = await createTopArtistsSnapshot(timeframe);
      if (!newSnapshot) return [];

      return newSnapshot.rankings.map((r) => ({
        user: r.user,
        totalUpvotes: r.totalUpvotes,
        projectCount: r.projectCount,
      }));
    }

    // Transform snapshot rankings to match expected format
    return snapshot.rankings.map((r) => ({
      user: r.user,
      totalUpvotes: r.totalUpvotes,
      projectCount: r.projectCount,
    }));
  } catch (error) {
    console.error(`Error getting top artists snapshot (${timeframe}):`, error);
    return [];
  }
};

/**
 * Select featured artist for the current week (LEGACY - based on project count)
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

    // Create featured artist record
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

    // ===== FIX 1: Send notification with correct parameters =====
    try {
      await notifyFeaturedArtist(selectedUser, startDate, endDate);
      console.log(`✅ Notification sent to user ${selectedUser}`);
    } catch (notifError) {
      console.error("Error sending featured artist notification:", notifError);
      // Don't fail the whole operation if notification fails
    }

    // ===== FIX 2: Add achievement to user's profile =====
    try {
      await User.findByIdAndUpdate(
        selectedUser,
        {
          $push: {
            "achievements.featuredArtist": {
              week: week,
              year: year,
              startDate: startDate,
              endDate: endDate,
              awardedAt: new Date(),
            },
          },
        },
        { new: true }
      );
      console.log(`✅ Achievement badge added to user ${selectedUser}`);
    } catch (badgeError) {
      console.error("Error adding achievement badge:", badgeError);
      // Don't fail the whole operation if badge update fails
    }

    console.log(`🏆 Featured Artist selected: ${featuredArtist.user.username}`);

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

/**
 * Create snapshot AND notify top 3 artists
 */
export const createTopArtistsSnapshotWithNotifications = async (
  timeframe = "week"
) => {
  try {
    // Create or get existing snapshot
    let snapshot = await createTopArtistsSnapshot(timeframe);

    if (!snapshot || snapshot.rankings.length === 0) {
      console.log(`No artists found for ${timeframe} snapshot`);
      return null;
    }

    // Populate user data if not already populated
    if (!snapshot.rankings[0].user.username) {
      await snapshot.populate(
        "rankings.user",
        "firstName lastName username avatar bio"
      );
    }

    // Notify and badge each of the top 3
    for (let i = 0; i < snapshot.rankings.length; i++) {
      const ranking = snapshot.rankings[i];
      const userId = ranking.user._id || ranking.user;
      const rank = i + 1;

      try {
        // Send notification
        // Send notification
        await notifyTopArtist(userId, rank, timeframe);
        console.log(
          `✅ Notification sent to rank #${rank}: ${ranking.user.username || userId}`
        );

        // Add achievement badge
        await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              [`achievements.top${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}Artists`]:
                {
                  rank: rank,
                  totalUpvotes: ranking.totalUpvotes,
                  projectCount: ranking.projectCount,
                  startDate: snapshot.startDate,
                  endDate: snapshot.endDate,
                  awardedAt: new Date(),
                },
            },
          },
          { new: true }
        );
        console.log(`✅ Achievement badge added to rank #${rank}`);
      } catch (error) {
        console.error(`Error notifying/badging rank #${rank}:`, error);
      }
    }

    console.log(
      `🎉 Top ${snapshot.rankings.length} artists notified for ${timeframe}!`
    );
    return snapshot;
  } catch (error) {
    console.error(`Error creating snapshot with notifications:`, error);
    throw error;
  }
};

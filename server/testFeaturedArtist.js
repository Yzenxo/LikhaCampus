// testFeaturedArtist.js
// Run this with: node testFeaturedArtist.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import FeaturedArtist from "./src/models/FeaturedArtist.js";
import Project from "./src/models/Project.js";
import User from "./src/models/User.js";

dotenv.config();

// Connect WITHOUT deprecated options
await mongoose.connect(process.env.MONGO_URI);
console.log("✓ Connected to MongoDB");

// Verify models are registered
console.log("Registered models:", mongoose.modelNames());

const createTestFeaturedArtist = async () => {
  try {
    console.log("🔍 Finding user with most projects...");

    // Find a user who has projects
    const userWithProjects = await Project.aggregate([
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
        $limit: 1,
      },
    ]);

    if (!userWithProjects || userWithProjects.length === 0) {
      console.log("❌ No users with projects found!");
      console.log("💡 Create some projects first, then run this script again.");
      process.exit(1);
    }

    const userId = userWithProjects[0]._id;
    const projectCount = userWithProjects[0].projectCount;

    console.log(`✅ Found user with ${projectCount} projects`);

    // Get current week dates
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Get week number
    const getWeekNumber = (date) => {
      const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    };

    const week = getWeekNumber(monday);
    const year = monday.getFullYear();

    // Check if already exists
    const existing = await FeaturedArtist.findOne({ week, year });

    if (existing) {
      console.log("⚠️  Featured artist already exists for this week!");
      console.log("Deleting old one and creating new...");
      await FeaturedArtist.deleteOne({ _id: existing._id });
    }

    // Create featured artist
    const featuredArtist = new FeaturedArtist({
      user: userId,
      week,
      year,
      startDate: monday,
      endDate: sunday,
      projectCount,
    });

    await featuredArtist.save();

    // Manually fetch user data instead of using populate
    const userDoc = await User.findById(featuredArtist.user).select(
      "firstName lastName avatar username bio"
    );

    if (!userDoc) {
      console.error("❌ User not found!");
      process.exit(1);
    }

    console.log("\n✨ TEST FEATURED ARTIST CREATED! ✨");
    console.log("==================================");
    console.log(`Name: ${userDoc.firstName} ${userDoc.lastName}`);
    console.log(`Username: @${userDoc.username}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Week: ${week}/${year}`);
    console.log(`Period: ${monday.toDateString()} - ${sunday.toDateString()}`);
    console.log("\n🚀 Now check your home page!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createTestFeaturedArtist();

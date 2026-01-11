import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Project from "./src/models/Project.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Check total projects
    const totalProjects = await Project.countDocuments();
    console.log(`\n📊 Total projects: ${totalProjects}`);

    // Check active projects
    const activeProjects = await Project.countDocuments({
      isArchived: false,
      "moderation.status": "active",
    });
    console.log(`✅ Active projects: ${activeProjects}`);

    // Check projects with upvotes
    const projectsWithUpvotes = await Project.countDocuments({
      isArchived: false,
      "moderation.status": "active",
      upvoteCount: { $gt: 0 },
    });
    console.log(`❤️ Projects with upvotes: ${projectsWithUpvotes}`);

    // Check projects created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProjects = await Project.countDocuments({
      isArchived: false,
      "moderation.status": "active",
      createdAt: { $gte: sevenDaysAgo },
    });
    console.log(`📅 Projects in last 7 days: ${recentProjects}`);

    // Show top 5 projects by upvotes (ALL TIME)
    const topProjects = await Project.find({
      isArchived: false,
      "moderation.status": "active",
    })
      .sort({ upvoteCount: -1 })
      .limit(5)
      .populate("author", "username")
      .select("title upvoteCount author createdAt");

    console.log("\n🏆 Top 5 projects by upvotes (ALL TIME):");
    topProjects.forEach((p, i) => {
      console.log(
        `   ${i + 1}. "${p.title}" by @${p.author?.username} - ${p.upvoteCount} upvotes (${p.createdAt.toLocaleDateString()})`
      );
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

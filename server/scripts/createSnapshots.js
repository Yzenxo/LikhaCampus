import dotenv from "dotenv";
import mongoose from "mongoose";
import { createTopArtistsSnapshot } from "../src/services/featuredArtistService.js";

dotenv.config();

const createSnapshots = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Create weekly snapshot
    console.log("📊 Creating weekly snapshot...");
    const weeklySnapshot = await createTopArtistsSnapshot("week");
    if (weeklySnapshot) {
      console.log("✅ Weekly snapshot created!");
      weeklySnapshot.rankings.forEach((r, i) => {
        console.log(
          `   ${i + 1}. ${r.user.username} - ${r.totalUpvotes} upvotes`
        );
      });
    }

    console.log("\n📊 Creating monthly snapshot...");
    const monthlySnapshot = await createTopArtistsSnapshot("month");
    if (monthlySnapshot) {
      console.log("✅ Monthly snapshot created!");
      monthlySnapshot.rankings.forEach((r, i) => {
        console.log(
          `   ${i + 1}. ${r.user.username} - ${r.totalUpvotes} upvotes`
        );
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Done! Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createSnapshots();

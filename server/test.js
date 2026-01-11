import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { selectFeaturedArtist } from "./src/services/featuredArtistService.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const result = await selectFeaturedArtist();

    if (result) {
      console.log("🏆 Featured Artist Selected:", result.user.username);
      console.log("📅 Week:", result.week, "Year:", result.year);
      console.log("🔔 Notification sent!");
    } else {
      console.log("⚠️ No eligible artist found");
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

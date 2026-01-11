import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { createTopArtistsSnapshotWithNotifications } from "./src/services/featuredArtistService.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    console.log("\n📊 Creating Weekly Top 3 (with notifications)...");
    await createTopArtistsSnapshotWithNotifications("week");

    console.log("\n📊 Creating Monthly Top 3 (with notifications)...");
    await createTopArtistsSnapshotWithNotifications("month");

    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

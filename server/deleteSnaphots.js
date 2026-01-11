import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import TopArtistsSnapshot from "./src/models/TopArtistsSnapshot.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const result = await TopArtistsSnapshot.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} snapshot(s)`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

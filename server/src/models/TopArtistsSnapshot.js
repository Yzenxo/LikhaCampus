import mongoose from "mongoose";

const TopArtistsSnapshotSchema = new mongoose.Schema({
  timeframe: {
    type: String,
    enum: ["week", "month"],
    required: true,
  },
  period: {
    // e.g., "2025-W02" for week 2 of 2025, or "2025-01" for January 2025
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rankings: [
    {
      rank: {
        type: Number,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      totalUpvotes: {
        type: Number,
        required: true,
      },
      projectCount: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to quickly find current snapshots
TopArtistsSnapshotSchema.index({ timeframe: 1, period: -1 });
TopArtistsSnapshotSchema.index({ startDate: -1, endDate: -1 });

const TopArtistsSnapshot = mongoose.model(
  "TopArtistsSnapshot",
  TopArtistsSnapshotSchema
);

export default TopArtistsSnapshot;

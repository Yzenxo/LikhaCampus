import mongoose from "mongoose";

const FeaturedArtistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
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
  projectCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FeaturedArtistSchema.index({ startDate: -1, endDate: -1 });

FeaturedArtistSchema.index({ user: 1, startDate: -1 });

const FeaturedArtist = mongoose.model("FeaturedArtist", FeaturedArtistSchema);

export default FeaturedArtist;

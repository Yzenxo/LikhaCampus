import mongoose from "mongoose";

const CommunityGuidelinesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CommunityGuidelinesSchema.index({ order: 1, isActive: 1 });

export default mongoose.model("CommunityGuidelines", CommunityGuidelinesSchema);

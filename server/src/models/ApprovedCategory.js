import mongoose from "mongoose";

const ApprovedCategorySchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure unique skill-category combinations
ApprovedCategorySchema.index(
  { skillName: 1, categoryName: 1 },
  { unique: true }
);

export default mongoose.model("ApprovedCategory", ApprovedCategorySchema);

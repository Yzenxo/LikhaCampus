import mongoose from "mongoose";

const CategoryRequestSchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    skillName: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries
CategoryRequestSchema.index({ status: 1, createdAt: -1 });
CategoryRequestSchema.index({ skillName: 1, categoryName: 1 });

export default mongoose.model("CategoryRequest", CategoryRequestSchema);

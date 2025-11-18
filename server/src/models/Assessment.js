import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responses: {
      type: Map,
      of: Number,
      required: true,
    },
    scores: {
      lifeSkills: { type: Number, required: true },
      technologySkills: { type: Number, required: true },
      learningSkills: { type: Number, required: true },
      literacySkills: { type: Number, required: true },
    },
    overallScore: { type: Number, required: true },
  },
  { timestamps: true }
);

AssessmentSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("Assessment", AssessmentSchema);

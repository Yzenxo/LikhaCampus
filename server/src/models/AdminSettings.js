import mongoose from "mongoose";

const AdminSettingsSchema = new mongoose.Schema(
  {
    currentAcademicYear: {
      type: String,
      required: true,
      default: "2025-2026",
    },
    currentSemester: {
      type: String,
      required: true,
      enum: ["First Semester", "Second Semester"],
      default: "First Semester",
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

AdminSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      currentAcademicYear: "2025-2026",
      currentSemester: "First Semester",
    });
  }
  return settings;
};

export default mongoose.model("AdminSettings", AdminSettingsSchema);

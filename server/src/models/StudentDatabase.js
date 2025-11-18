import mongoose from "mongoose";

const StudentDatabaseSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    studentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 9,
    },
    yearLevel: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
  },
  { timestamps: true }
);

StudentDatabaseSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model("StudentDatabase", StudentDatabaseSchema);

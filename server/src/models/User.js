import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email",
      ],
    },
    studentNumber: { type: String, required: true, unique: true, minLength: 9 },
    yearLevel: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    program: {
      type: String,
      required: false,
      enum: [
        "Bachelor of Secondary Education",
        "Bachelor of Technical Vocational Teacher Education",
        "BS Business Management",
        "BS Computer Engineering",
        "BS Computer Science",
        "BS Electrical Engineering",
        "BS Hospitality Management",
        "BS Industrial Education",
        "BS Information Technology",
      ],
    },
    password: { type: String, required: true, minLength: 8 },
    registrationFormPath: {
      url: String,
      publicId: String,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    firstName: { type: String, required: true, trim: true, minLength: 2 },
    lastName: { type: String, required: true, trim: true, minLength: 2 },
    bio: { type: String, default: "" },
    avatar: {
      url: { type: String, required: true },
      publicId: { type: String, default: "" },
      caption: { type: String, default: "" },
      order: { type: String, default: "" },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 2,
    },
    headerImage: {
      url: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920",
      },
      publicId: String,
    },
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        details: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "reviewed", "dismissed"],
          default: "pending",
        },
      },
    ],

    hasAssessment: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

    registrationFormVerified: {
      type: Boolean,
      default: false,
    },
    registrationSemester: String,
    registrationAcademicYear: String,

    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },

    needsReVerification: {
      type: Boolean,
      default: false,
    },
    reVerificationReason: {
      type: String,
      default: "",
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    isDeactivated: {
      type: Boolean,
      default: false,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

export default mongoose.model("User", UserSchema);

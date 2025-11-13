import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: {
      url: String,
      publicId: String,
    },
    imageUrl: { type: String, publicId: String, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ createdAt: -1 });

export default mongoose.model("Announcement", AnnouncementSchema);

import { v2 as cloudinary } from "cloudinary";
import Announcement from "../models/Announcement.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ===== CREATE ANNOUNCEMENT =====
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!title || !content) {
      return res.status(400).json({
        error: "Please provide title and content",
      });
    }

    const createdBy = req.user._id;

    const publicId = req.file.filename;

    const announcement = new Announcement({
      title,
      content,
      imageUrl: req.file.path,
      image: {
        url: req.file.path,
        publicId: publicId,
      },
      createdBy,
    });

    const savedAnnouncement = await announcement.save();

    try {
      const users = await User.find({
        _id: { $ne: createdBy },
      }).select("_id");

      const notificationPromises = users.map((user) =>
        createNotification({
          recipient: user._id,
          sender: createdBy,
          type: "announcement",
          targetType: "Announcement",
          targetId: savedAnnouncement._id,
          message: `New announcement: ${title}`,
        })
      );

      const results = await Promise.all(notificationPromises);

      const verifyCount = await Notification.countDocuments({
        targetId: savedAnnouncement._id,
        type: "announcement",
      });
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError);
    }

    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Error creating announcement" });
  }
};

// ===== GET ALL ANNOUNCEMENT =====
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements: ", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: announcement.length,
      data: announcement,
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement",
    });
  }
};

// ===== UPDATE ANNOUNCEMENT =====
export const updateAnnouncement = async (req, res) => {
  try {
    // Debug log to see what's in req.body
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({
        error:
          "Request body is missing. Make sure you're sending form data correctly.",
      });
    }

    const { title, content } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Handle image update
    if (req.file) {
      // Delete old image from cloudinary
      if (announcement.image?.publicId) {
        try {
          await cloudinary.uploader.destroy(announcement.image.publicId);
        } catch (cloudinaryError) {
          console.error("Error deleting old image:", cloudinaryError);
          // Continue even if deletion fails
        }
      }

      // Update with new image
      announcement.imageUrl = req.file.path;
      announcement.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    // Update title and content only if provided
    if (title) announcement.title = title;
    if (content) announcement.content = content;

    await announcement.save();

    res
      .status(200)
      .json({ message: "Announcement updated successfully", announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({
      error: "Error updating announcement",
      details: error.message,
    });
  }
};

// ===== DELETE ANNOUNCEMENT =====
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    if (announcement.image?.publicId) {
      await cloudinary.uploader.destroy(announcement.image.publicId);
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Error deleting announcement" });
  }
};

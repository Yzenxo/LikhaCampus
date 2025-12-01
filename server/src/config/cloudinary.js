import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// Export configuration function to be called AFTER dotenv loads
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// NEW: Local storage for registration forms (process first, then upload)
const localRegistrationFormStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "temp/uploads";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "regform-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Cloudinary storage (kept for reference, but not used for registration forms anymore)
const registrationFormStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "likhacampus/registration_forms",
    resource_type: "raw", // Changed from "auto" to "raw" for PDFs
    allowed_formats: ["pdf"],
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "likhacampus/users/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 512, height: 512, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

// NEW: Header image storage for profile covers
const headerImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "likhacampus/users/headers",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1500, height: 500, crop: "fill" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "likhacampus/projects/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "likhacampus/projects/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
    transformation: [
      { width: 1280, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

const announcementStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "likhacampus/announcements",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  },
});

// UPDATED: Use local storage for registration forms
export const uploadRegistrationForm = multer({
  storage: localRegistrationFormStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// NEW: Header image uploader
export const uploadHeaderImage = multer({
  storage: headerImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
  },
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 30 * 1024 * 1024 },
});

export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

export const uploadAnnouncement = multer({
  storage: announcementStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadToCloudinary = async (filePath, folder, isVideo = false) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `likhacampus/projects/${folder}`,
      resource_type: isVideo ? "video" : "image",
      transformation: isVideo
        ? [
            { width: 1280, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ]
        : [
            { width: 1920, height: 1080, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // Added resource_type parameter
    });
    console.log("Deleted from Cloudinary:", publicId, result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export default cloudinary;

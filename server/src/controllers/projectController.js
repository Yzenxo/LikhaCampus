import mongoose from "mongoose";
import cloudinary, {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import Project from "../models/Project.js";
import {
  notifyProjectDeleted,
  notifyProjectReported,
  notifyProjectRestored,
} from "../services/notificationService.js";
import { createNotification } from "./notificationController.js";

// ===== UPLOAD PROJECT =====
export const uploadProject = async (req, res) => {
  try {
    const { title, description, skill, category } = req.body;

    const taggedUsers = req.extractedTaggedUsers || req.body.taggedUsers;

    if (!title || !skill || !category) {
      return res.status(400).json({
        error: "Title, skill, and category are required.",
      });
    }

    const files = req.files
      ? req.files.filter((f) => f.fieldname === "files")
      : req.files;
    const images = [];
    const videos = [];

    for (const file of files) {
      const isVideo = file.mimetype.startsWith("video/");

      if (isVideo) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "likhacampus/projects/videos",
          resource_type: "video",
          transformation: [
            { width: 1280, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        });

        const thumbnailUrl = result.secure_url
          .replace("/video/upload/", "/video/upload/so_0,w_400,h_300,c_fill/")
          .replace(/\.[^.]+$/, ".jpg");

        videos.push({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnail: thumbnailUrl,
        });
      } else {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "likhacampus/projects/images",
          transformation: [
            { width: 1920, height: 1080, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        });

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const processedTags = taggedUsers
      ? JSON.parse(taggedUsers).filter(
          (id) => id && mongoose.Types.ObjectId.isValid(id)
        )
      : [];

    const project = new Project({
      author: req.session.userId,
      title,
      description,
      skill,
      category,
      images,
      videos,
      taggedUsers: processedTags,
    });

    await project.save();
    if (images.length > 0) {
      project.thumbnail = images[0].url;
    } else if (videos.length > 0) {
      project.thumbnail = videos[0].url;
    }

    await project.populate("author", "firstName lastName avatar username");
    await project.populate("taggedUsers", "firstName lastName avatar username");

    if (processedTags.length > 0) {
      for (const taggedUserId of processedTags) {
        if (taggedUserId.toString() !== req.session.userId) {
          await createNotification({
            recipient: taggedUserId,
            sender: req.session.userId,
            type: "project_tag",
            targetType: "Project",
            targetId: project._id,
            message: "tagged you in a project",
          });
        }
      }
    }

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project: ", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET TAGGED PROJECTS =====
export const getTaggedProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await Project.find({
      taggedUsers: userId,
      isArchived: false,
      "moderation.status": "active",
    })
      .populate("author", "firstName lastName avatar username")
      .populate("taggedUsers", "firstName lastName avatar username")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== GET ALL PROJECTS (WITH PAGINATION & FILTERS) =====
export const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { skill, category, search } = req.query;

    let filter = {
      isArchived: false,
      "moderation.status": "active",
    };

    if (skill) {
      filter.skill = skill;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("author", "firstName lastName avatar username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalProjects: totalCount,
        hasMore: skip + projects.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET ALL USER'S PROJECT =====
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      author: req.params.userId,
      isArchived: false,
      "moderation.status": "active",
    })
      .populate("author", "firstName lastName avatar username")
      .populate("taggedUsers", "firstName lastName avatar username")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== GET USER PROJECT =====
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("author", "firstName lastName username avatar")
      .populate("taggedUsers", "firstName lastName username avatar");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// ===== REPORT PROJECT =====
export const reportProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason, details } = req.body;
    const userId = req.session.userId;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ error: "Report reason is required" });
    }

    const project = await Project.findById(projectId).populate("author");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const alreadyReported = project.moderation.reports.some(
      (report) => report.userId.toString() === userId
    );

    if (alreadyReported) {
      return res
        .status(400)
        .json({ error: "You have already reported this project" });
    }

    project.moderation.reports.push({
      userId,
      reason: reason.trim(),
      details: details || "",
      reportedAt: new Date(),
    });

    if (project.moderation.status === "active") {
      project.moderation.status = "reported";

      await notifyProjectReported(
        project.author._id.toString(),
        projectId,
        reason.trim()
      );
    }

    await project.save();

    res.json({ message: "Project reported successfully" });
  } catch (error) {
    console.error("Error reporting project:", error);
    res.status(500).json({ error: "Failed to report project" });
  }
};

// ===== ADMIN: GET REPORTED PROJECTS =====
export const getReportedProjects = async (req, res) => {
  try {
    const reportedProjects = await Project.find({
      "moderation.status": { $in: ["reported", "hidden"] },
      isArchived: false,
    })
      .populate("author", "firstName lastName username email avatar")
      .populate("moderation.reports.userId", "firstName lastName username")
      .sort({ "moderation.reports.0.reportedAt": -1 });

    res.json({ projects: reportedProjects });
  } catch (error) {
    console.error("Error fetching reported projects:", error);
    res.status(500).json({ error: "Failed to fetch reported projects" });
  }
};

// ===== ADMIN: RESTORE REPORTED PROJECT =====
export const restoreReportedProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        "moderation.status": "active",
        "moderation.reviewedBy": req.session.userId,
        "moderation.reviewedAt": new Date(),
        "moderation.reports": [],
      },
      { new: true }
    ).populate("author", "firstName lastName username avatar");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await notifyProjectRestored(project.author._id.toString(), projectId);

    res.json({ message: "Project restored successfully", project });
  } catch (error) {
    console.error("Error restoring project:", error);
    res.status(500).json({ error: "Failed to restore project" });
  }
};

// ===== ADMIN: DELETE REPORTED PROJECT =====
export const deleteReportedProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    for (const image of project.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    for (const video of project.videos) {
      if (video.publicId) {
        await cloudinary.uploader.destroy(video.publicId, {
          resource_type: "video",
        });
      }
    }

    await notifyProjectDeleted(
      project.author._id.toString(),
      projectId,
      "Violation of community guidelines"
    );

    await Project.findByIdAndDelete(projectId);

    res.json({ message: "Project permanently deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// ===== ARCHIVE PROJECT =====
export const archiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    if (project.author.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only archive your own projects." });
    }

    project.isArchived = true;
    await project.save();

    res.json({ message: "Project archived successfully!", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== RESTORE PROJECT =====
export const restoreProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    if (project.author.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only archive your own projects." });
    }

    project.isArchived = false;
    await project.save();

    res.json({ message: "Project restored successfully!", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== GET USER'S ARCHIVED PROJECTS =====
export const getArchivedProjects = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const projects = await Project.find({
      author: userId,
      isArchived: true,
    })
      .populate("author", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== EDIT PROJECT =====
export const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skill, category, taggedUsers } = req.body;
    const userId = req.user._id;

    if (!title?.trim() || !description?.trim() || !skill || !category) {
      return res.status(400).json({
        error: "Title, description, skill, and category are required.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    if (project.author.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "You are not authorized to edit this project.",
      });
    }

    project.title = title.trim();
    project.description = description.trim();
    project.skill = skill;
    project.category = category;

    if (taggedUsers !== undefined) {
      const processedTags = taggedUsers
        ? JSON.parse(taggedUsers).filter(
            (id) => id && mongoose.Types.ObjectId.isValid(id)
          )
        : [];

      const oldTags = project.taggedUsers.map((id) => id.toString());
      const newlyTagged = processedTags.filter(
        (id) => !oldTags.includes(id.toString())
      );

      project.taggedUsers = processedTags;

      for (const taggedUserId of newlyTagged) {
        if (taggedUserId.toString() !== userId.toString()) {
          await createNotification({
            recipient: taggedUserId,
            sender: userId,
            type: "project_tag",
            targetType: "Project",
            targetId: project._id,
            message: "tagged you in a project",
          });
        }
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadedImages = [];
      const uploadedVideos = [];

      for (const img of project.images) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
      for (const vid of project.videos) {
        if (vid.publicId) {
          await deleteFromCloudinary(vid.publicId);
        }
      }

      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith("video/");

        const uploadResult = await uploadToCloudinary(
          file.path,
          isVideo ? "videos" : "images"
        );

        if (isVideo) {
          const thumbnailUrl = uploadResult.secure_url
            .replace("/video/upload/", "/video/upload/so_0,w_400,h_300,c_fill/")
            .replace(/\.[^.]+$/, ".jpg");

          uploadedVideos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            thumbnail: thumbnailUrl,
            order: uploadedVideos.length,
          });
        } else {
          uploadedImages.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            order: uploadedImages.length,
          });
        }
      }

      project.images = uploadedImages;
      project.videos = uploadedVideos;

      project.thumbnail =
        uploadedImages[0]?.url || uploadedVideos[0]?.thumbnail || null;
    }

    await project.save();

    await project.populate("author", "firstName lastName username avatar");
    await project.populate("taggedUsers", "firstName lastName username avatar");

    res.json({
      message: "Project updated successfully",
      project: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project." });
  }
};

// ===== DELETE PROJECT =====
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    if (project.author.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own projects." });
    }
    for (const image of project.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }
    for (const video of project.videos) {
      if (video.publicId) {
        await cloudinary.uploader.destroy(video.publicId, {
          resource_type: "video",
        });
      }
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

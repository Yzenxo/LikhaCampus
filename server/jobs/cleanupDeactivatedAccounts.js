import cloudinary from "../src/config/cloudinary.js";
import ForumComment from "../src/models/ForumComment.js";
import ForumPost from "../src/models/ForumPost.js";
import Project from "../src/models/Project.js";
import User from "../src/models/User.js";

export const cleanupDeactivatedAccounts = async () => {
  try {
    console.log("Checking for deactivated accounts to delete...");

    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    const expiredAccounts = await User.find({
      isDeactivated: true,
      deactivatedAt: { $lte: fifteenDaysAgo },
    });

    console.log(`Found ${expiredAccounts.length} expired accounts`);

    for (const user of expiredAccounts) {
      console.log(`Deleting expired account: ${user.email}`);

      // Delete projects and Cloudinary assets
      const projects = await Project.find({ author: user._id });
      for (const project of projects) {
        for (const image of project.images) {
          if (image.publicId) {
            try {
              await cloudinary.uploader.destroy(image.publicId);
            } catch (err) {
              console.log(`Failed to delete image: ${image.publicId}`);
            }
          }
        }
        for (const video of project.videos) {
          if (video.publicId) {
            try {
              await cloudinary.uploader.destroy(video.publicId, {
                resource_type: "video",
              });
            } catch (err) {
              console.log(`Failed to delete video: ${video.publicId}`);
            }
          }
        }
      }
      await Project.deleteMany({ author: user._id });

      // Delete posts and comments (FIXED: using ForumPost and ForumComment)
      const posts = await ForumPost.find({ author: user._id });
      for (const post of posts) {
        await ForumComment.deleteMany({ post: post._id });
      }
      await ForumPost.deleteMany({ author: user._id });
      await ForumComment.deleteMany({ author: user._id });

      // Delete user's avatar
      if (user.avatar?.publicId) {
        try {
          await cloudinary.uploader.destroy(user.avatar.publicId);
        } catch (err) {
          console.log(`Failed to delete avatar: ${user.avatar.publicId}`);
        }
      }

      // Delete user's ID photo
      if (user.idPhotoPath?.publicId) {
        try {
          await cloudinary.uploader.destroy(user.idPhotoPath.publicId);
        } catch (err) {
          console.log(
            `Failed to delete ID photo: ${user.idPhotoPath.publicId}`
          );
        }
      }

      // Delete user
      await User.findByIdAndDelete(user._id);

      console.log(`✅ Deleted account: ${user.email}`);
    }

    console.log("Cleanup completed!");
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};

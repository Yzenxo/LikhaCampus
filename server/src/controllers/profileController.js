import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

// ===== GET CURRENT USER PROFILE =====
export const getCurrentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ===== GET PROFILE BY USERNAME (PUBLIC - NO AUTH REQUIRED) =====
export const getProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
      isDeactivated: false,
    }).select(
      "-password -email -studentNumber -registrationFormPath -emailVerificationToken -loginAttempts -lockUntil -lockCount -emailVerificationExpires -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== SEARCH USERS =====
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: "Search query must be at least 2 characters",
      });
    }

    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
    })
      .select("firstName lastName username avatar")
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== UPDATE USER PROFILE =====
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, headerColor } = req.body;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    if (headerColor !== undefined) {
      // Validate hex color format
      if (!/^#[0-9A-F]{6}$/i.test(headerColor)) {
        return res.status(400).json({
          error: "Invalid color format. Must be a hex color (e.g., #5865F2)",
        });
      }
      updateData.headerColor = headerColor;
    }

    if (req.file) {
      console.log("File received:", req.file);

      const currentUser = await User.findById(req.session.userId);

      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (
        currentUser.avatar?.publicId &&
        currentUser.avatar.publicId.startsWith("likhow/")
      ) {
        try {
          console.log("Deleting old avatar:", currentUser.avatar.publicId);
          await cloudinary.uploader.destroy(currentUser.avatar.publicId);
        } catch (error) {
          console.log("Error deleting old avatar:", error);
        }
      }

      updateData.avatar = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log("New avatar prepared:", updateData.avatar);
    }

    const user = await User.findByIdAndUpdate(req.session.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Profile updated successfully!");
    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// ===== CHANGE PASSWORD =====
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Change password error: ", error);
    res.status(500).json({ error: "Failed to change password." });
  }
};

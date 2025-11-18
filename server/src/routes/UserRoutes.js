import express from "express";
import { uploadAvatar, uploadHeaderImage } from "../config/cloudinary.js";
import {
  changePassword,
  getCurrentProfile,
  getProfileByUsername,
  searchUsers,
  updateProfile,
  uploadHeaderImage as uploadHeaderImageController,
} from "../controllers/profileController.js";
import {
  deactivateAccount,
  deleteAccountPermanently,
  reactivateAccount,
  reportUser,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import User from "../models/User.js";
import { updateProfileSchema } from "../validators/userValidators.js";

const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    console.log("==================");
    console.log("UserRoutes// /me endpoint hit");
    console.log("UserRoutes// Session ID:", req.sessionID);
    console.log(
      "UserRoutes// Full session object:",
      JSON.stringify(req.session, null, 2)
    );
    console.log("UserRoutes// Session userId:", req.session?.userId);
    console.log("UserRoutes// Cookies received:", req.headers.cookie);
    console.log("==================");

    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/profile/:username", getProfileByUsername);

router.use(requireAuth);
router.get("/search", searchUsers);
router.post("/:userId/report", requireAuth, reportUser);
router.get("/profile", getCurrentProfile);
router.patch("/profile", updateProfile);
router.patch(
  "/settings",
  uploadAvatar.single("avatar"),
  validate(updateProfileSchema),
  updateProfile
);
router.put(
  "/header-image",
  requireAuth,
  uploadHeaderImage.single("headerImage"),
  uploadHeaderImageController
);
router.put("/change-password", changePassword);
router.post("/account/deactivate", requireAuth, deactivateAccount);
router.post("/account/reactivate", reactivateAccount);
router.delete("/account/delete", requireAuth, deleteAccountPermanently);

export default router;

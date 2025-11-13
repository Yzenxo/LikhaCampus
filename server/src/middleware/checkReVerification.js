import User from "../models/User.js";

export const checkReVerification = async (req, res, next) => {
  try {
    // Skip check for public routes
    const publicPaths = [
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/reverify",
    ];
    if (publicPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return next();
    }

    // If user needs re-verification, block certain actions
    if (user.needsReVerification) {
      // Allow access to profile/settings so they can re-verify
      const allowedPaths = [
        "/api/user/me",
        "/api/user/reverify",
        "/api/auth/logout",
      ];

      if (allowedPaths.some((path) => req.path.includes(path))) {
        return next();
      }

      // Block other actions
      return res.status(403).json({
        needsReVerification: true,
        message:
          "Please upload your new registration form to continue using the platform.",
        reason: user.reVerificationReason,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

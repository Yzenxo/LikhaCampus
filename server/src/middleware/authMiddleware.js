import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      console.log("authMid// No session or userId");
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      console.log("authMid// User not found in database");

      req.session.destroy();
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("authMid// Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("authMid// Admin auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

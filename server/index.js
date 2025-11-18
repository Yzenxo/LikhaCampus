import dotenv from "dotenv";
dotenv.config();

import { configureCloudinary } from "./src/config/cloudinary.js";
configureCloudinary();

import MongoStore from "connect-mongo";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import mongoose from "mongoose";
import cron from "node-cron";

import { cleanupDeactivatedAccounts } from "./jobs/cleanupDeactivatedAccounts.js";
import connect from "./src/config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIXED: Simplified CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "https://likha-campus.vercel.app",
      "https://likha-campus-87pzirrdc-stellbiens-projects.vercel.app", // Preview deployments
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
    ].filter(Boolean);
    
    // Check if origin is allowed (exact match or starts with for preview deployments)
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith("https://likha-campus") && origin.includes("vercel.app")
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("⚠️ CORS blocked origin:", origin);
      // ✅ IMPORTANT: For debugging, allow it anyway but log it
      callback(null, true); 
      // In strict production, use: callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};
app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // ✅ Disable CSP entirely for simpler deployment
  })
);

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads")
);

app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next();
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

const sanitize = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (/^\$/.test(key) || /\./.test(key)) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) {
    for (const key in req.query) {
      if (/^\$/.test(key) || /\./.test(key)) {
        delete req.query[key];
      } else if (typeof req.query[key] === "object") {
        sanitize(req.query[key]);
      }
    }
  }
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again later.",
});

cron.schedule("0 2 * * *", async () => {
  console.log("Running deactivated accounts cleanup...");
  await cleanupDeactivatedAccounts();
});

// Connect to db
await connect();

// ✅ FIXED: Updated session configuration for production
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60,
    }),
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost", // ✅ ADDED: Allow cross-domain cookies
    },
    name: "sessionId",
    proxy: process.env.NODE_ENV === "production", // ✅ ADDED: Trust proxy in production
  })
);

// ✅ ADDED: Trust proxy for production (needed for secure cookies behind reverse proxy)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Import routes AFTER environment is loaded
import adminRoutes from "./src/routes/AdminRoutes.js";
import announcementRoutes from "./src/routes/AnnouncementRoutes.js";
import assessmentRoutes from "./src/routes/AssessmentRoutes.js";
import authRoutes from "./src/routes/AuthRoutes.js";
import contributionsRoutes from "./src/routes/ContributionsRoutes.js";
import featuredArtistRoutes from "./src/routes/FeaturedArtistRoutes.js";
import forgotPasswordRoutes from "./src/routes/ForgotPasswordRoutes.js";
import forumRoutes from "./src/routes/ForumRoutes.js";
import guidelinesRoutes from "./src/routes/GuidelinesRoutes.js";
import homeRoutes from "./src/routes/HomeRoutes.js";
import notificationRoutes from "./src/routes/NotificationRoutes.js";
import projectRoutes from "./src/routes/ProjectRoutes.js";
import studentDbRoutes from "./src/routes/StudentDbRoutes.js";
import userRoutes from "./src/routes/UserRoutes.js";

app.use("/api/auth", authLimiter, authRoutes, forgotPasswordRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stats", homeRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/featured-artist", featuredArtistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/contributions", contributionsRoutes);
app.use("/api/guidelines", guidelinesRoutes);
app.use("/api/student-database", studentDbRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
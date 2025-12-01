import axios from "axios";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ProtectedRouter from "../../client/src/components/Shared/ProtectedRouter.jsx";
import { UserContext } from "./context/UserContext.js";
import "./index.css";
import "./styles/custom.css";

// Eager load
import ReVerificationModal from "./components/User/ReVerificationModal.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AdminNavbar from "./pages/navbars/AdminNavbar.jsx";
import UserNavbar from "./pages/navbars/UserNavbar.jsx";
import ForgotPassword from "./pages/users/ForgotPassword.jsx";
import ResetPassword from "./pages/users/ResetPassword.jsx";
import VerifyEmailNotice from "./pages/users/VerifyEmailNotice.jsx";
import VerifyEmailSuccess from "./pages/users/VerifyEmailSuccess.jsx";

// User pages
const About = lazy(() => import("./pages/users/About.jsx"));
const Archives = lazy(() => import("./pages/users/Archives.jsx"));
const FAQ = lazy(() => import("./pages/users/Faq.jsx"));
const Forum = lazy(() => import("./pages/users/Forum.jsx"));
const Home = lazy(() => import("./pages/users/Home.jsx"));
const Profile = lazy(() => import("./pages/users/Profile.jsx"));
const Projects = lazy(() => import("./pages/users/Projects.jsx"));
const Settings = lazy(() => import("./pages/users/Settings.jsx"));
const Skills = lazy(() => import("./pages/users/Skills.jsx"));
const SkillsAssessment = lazy(
  () => import("./pages/users/SkillsAssessment.jsx")
);
const ViewAllNotifications = lazy(
  () => import("./pages/users/ViewAllNotifications.jsx")
);
const ViewProject = lazy(() => import("./pages/users/ViewProject.jsx"));

// Admin pages
const AnnouncementPanel = lazy(
  () => import("./pages/admin/AnnouncementPanel.jsx")
);
const CommunityGuidelines = lazy(
  () => import("./pages/admin/CommunityGuidelines.jsx")
);
const ExcelUploadPanel = lazy(
  () => import("./pages/admin/ExcelUploadPanel.jsx")
);
const ForumViolations = lazy(() => import("./pages/admin/ForumViolations.jsx"));
const ProjectViolations = lazy(
  () => import("./pages/admin/ProjectViolations.jsx")
);
const Reports = lazy(() => import("./pages/admin/Reports.jsx"));
const SemesterSettings = lazy(
  () => import("./pages/admin/SemesterSettings.jsx")
);
const UploadedProjects = lazy(
  () => import("./pages/admin/UploadedProjects.jsx")
);
const UserContributions = lazy(
  () => import("./pages/admin/UserContributions.jsx")
);
const UserRoleManagement = lazy(
  () => import("./pages/admin/UserRoleManagement.jsx")
);
const UserViolations = lazy(() => import("./pages/admin/UserViolations.jsx"));

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
axios.defaults.withCredentials = true;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsReVerification, setNeedsReVerification] = useState(false);
  const [reVerificationReason, setReVerificationReason] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/user/me", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);

        if (response.data.user?.needsReVerification) {
          setNeedsReVerification(true);
          setReVerificationReason(response.data.user.reVerificationReason);
        } else {
          setNeedsReVerification(false);
          setReVerificationReason("");
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
          setNeedsReVerification(false);
          setReVerificationReason("");

          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/verify-email-notice",
            "/verify-email",
          ];

          // Check if current path is a public profile path
          const isPublicProfilePath = location.pathname.startsWith("/profile/");

          // Check if on reset password path
          const isResetPasswordPath =
            location.pathname.startsWith("/reset-password");

          const isPublicPath =
            publicPaths.includes(location.pathname) ||
            isResetPasswordPath ||
            isPublicProfilePath;

          // Only redirect to login if NOT on a public path
          if (!isPublicPath) {
            navigate("/login");
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location.pathname, navigate]);

  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {user && needsReVerification && (
        <ReVerificationModal
          isOpen={true}
          reason={reVerificationReason}
          onSuccess={() => {
            setNeedsReVerification(false);
            axios.get("/api/user/me", { withCredentials: true }).then((res) => {
              setUser(res.data.user);
            });
          }}
        />
      )}

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* STARTING ROUTES */}
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
          <Route path="/verify-email" element={<VerifyEmailSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* USER ROUTES - Navbar included */}
          <Route element={<UserNavbar />}>
            {/* PUBLIC PROFILE - Anyone can view (with navbar) */}
            <Route path="profile/:username" element={<Profile />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* PROTECTED USER ROUTES */}
          <Route
            element={
              <ProtectedRouter
                user={user}
                role="user"
                loading={loading}
                redirectTo="/login"
              />
            }
          >
            <Route element={<UserNavbar />}>
              <Route path="home" element={<Home />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="about" element={<About />} />
              <Route path="forum" element={<Forum />} />
              <Route path="projects" element={<Projects />} />
              <Route path="skills" element={<Skills />} />
              <Route path="/skills/assessment" element={<SkillsAssessment />} />
              <Route
                path="all-notifications"
                element={<ViewAllNotifications />}
              />
              <Route path="settings" element={<Settings />} />
              <Route path="projects/:projectId" element={<ViewProject />} />
              <Route path="archives" element={<Archives />} />
            </Route>
          </Route>

          {/* ADMIN ROUTES */}
          <Route
            element={
              <ProtectedRouter
                user={user}
                role="admin"
                loading={loading}
                redirectTo="/login"
              />
            }
          >
            <Route path="/admin" element={<AdminNavbar />}>
              <Route path="reports" element={<Reports />} />
              <Route path="announcements" element={<AnnouncementPanel />} />
              <Route
                path="project-violations"
                element={<ProjectViolations />}
              />
              <Route path="user-violations" element={<UserViolations />} />
              <Route path="projects" element={<UploadedProjects />} />
              <Route path="forum-violations" element={<ForumViolations />} />
              <Route path="guidelines" element={<CommunityGuidelines />} />
              <Route path="user-roles" element={<UserRoleManagement />} />
              <Route
                path="user-contributions"
                element={<UserContributions />}
              />
              <Route path="semester-settings" element={<SemesterSettings />} />
              <Route path="excel-upload" element={<ExcelUploadPanel />} />
            </Route>
          </Route>

          {/* FALLBACK - Redirect to appropriate page based on role */}
          <Route
            path="*"
            element={
              loading ? (
                <span className="loading loading-spinner text-primary"></span>
              ) : user ? (
                user.role === "admin" ? (
                  <Navigate to="/admin" />
                ) : (
                  <Navigate to="/home" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Suspense>
    </UserContext.Provider>
  );
}

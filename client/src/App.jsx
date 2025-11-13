import axios from "axios";
import { useEffect, useState } from "react";
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

// Starting pages
import ReVerificationModal from "./components/User/ReVerificationModal.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// User pages
import UserNavbar from "./pages/navbars/UserNavbar.jsx";
import About from "./pages/users/About.jsx";
import Archives from "./pages/users/Archives.jsx";
import FAQ from "./pages/users/Faq.jsx";
import ForgotPassword from "./pages/users/ForgotPassword.jsx";
import Forum from "./pages/users/Forum.jsx";
import Home from "./pages/users/Home.jsx";
import Profile from "./pages/users/Profile.jsx";
import Projects from "./pages/users/Projects.jsx";
import ResetPassword from "./pages/users/ResetPassword.jsx";
import Settings from "./pages/users/Settings.jsx";
import Skills from "./pages/users/Skills.jsx";
import SkillsAssessment from "./pages/users/SkillsAssessment.jsx";
import VerifyEmailNotice from "./pages/users/VerifyEmailNotice.jsx";
import VerifyEmailSuccess from "./pages/users/VerifyEmailSuccess.jsx";
import ViewAllNotifications from "./pages/users/ViewAllNotifications.jsx";
import ViewProject from "./pages/users/ViewProject.jsx";

// Admin pages
import AnnouncementPanel from "./pages/admin/AnnouncementPanel.jsx";
import CommunityGuidelines from "./pages/admin/CommunityGuidelines.jsx";
import ExcelUploadPanel from "./pages/admin/ExcelUploadPanel.jsx";
import ForumViolations from "./pages/admin/ForumViolations.jsx";
import ProjectViolations from "./pages/admin/ProjectViolations.jsx";
import Reports from "./pages/admin/Reports.jsx";
import SemesterSettings from "./pages/admin/SemesterSettings.jsx";
import UploadedProjects from "./pages/admin/UploadedProjects.jsx";
import UserContributions from "./pages/admin/UserContributions.jsx";
import UserRoleManagement from "./pages/admin/UserRoleManagement.jsx";
import UserViolations from "./pages/admin/UserViolations.jsx";
import AdminNavbar from "./pages/navbars/AdminNavbar.jsx";

axios.defaults.baseURL = "http://localhost:5000";
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
      .get("/api/user/me", { withCredentials: true })
      .then((response) => {
        console.log("User authenticated.");
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
            <Route path="project-violations" element={<ProjectViolations />} />
            <Route path="user-violations" element={<UserViolations />} />
            <Route path="projects" element={<UploadedProjects />} />
            <Route path="forum-violations" element={<ForumViolations />} />
            <Route path="guidelines" element={<CommunityGuidelines />} />
            <Route path="user-roles" element={<UserRoleManagement />} />
            <Route path="user-contributions" element={<UserContributions />} />
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
    </UserContext.Provider>
  );
}

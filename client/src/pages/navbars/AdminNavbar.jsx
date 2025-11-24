import axios from "axios";
import {
  BarChart2,
  Folder,
  FolderX,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareX,
  Pin,
  University,
  Upload,
  UserPen,
  UserRoundX,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";

const AdminNavbar = () => {
  const { showAlert } = useAlert();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Reports",
      icon: <BarChart2 size={18} />,
      path: "/admin/reports",
    },
    {
      name: "Announcement Panel",
      icon: <Megaphone size={18} />,
      path: "/admin/announcements",
    },
    {
      name: "Guidelines",
      icon: <Pin size={18} />,
      path: "/admin/guidelines",
    },
    {
      name: "Uploaded Projects",
      icon: <Folder size={18} />,
      path: "/admin/projects",
    },
    {
      name: "User Role Management",
      icon: <UserPen size={18} />,
      path: "/admin/user-roles",
    },
    {
      name: "User Contributions",
      icon: <Users size={18} />,
      path: "/admin/user-contributions",
    },
    {
      name: "Semester Settings",
      icon: <University size={18} />,
      path: "/admin/semester-settings",
    },
    {
      name: "Excel Upload",
      icon: <Upload size={18} />,
      path: "/admin/excel-upload",
    },
    {
      name: "Forum Violations",
      icon: <MessageSquareX size={18} />,
      path: "/admin/forum-violations",
    },
    {
      name: "Project Violations",
      icon: <FolderX size={18} />,
      path: "/admin/project-violations",
    },
    {
      name: "User Violations",
      icon: <UserRoundX size={18} />,
      path: "/admin/user-violations",
    },
    { name: "Log out", icon: <LogOut size={18} />, path: "#logout" },
  ];

  const logoutAdmin = async () => {
    try {
      await axios.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
      showAlert("Logout failed. Please try again.", "error");
    }
  };

  const handleLogout = (e, item) => {
    if (item.path === "#logout") {
      e.preventDefault();
      logoutAdmin();
    }
  };

  const handleNavClick = (e, item) => {
    handleLogout(e, item);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* MOBILE OVERLAY */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            bg-white border-r border-gray-200 flex flex-col
            transition-all duration-300
            ${collapsed ? "lg:w-20" : "lg:w-64"}
            ${mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* SIDEBAR HEADER */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!collapsed && (
              <span className="font-bold text-lg">LikhaCampus</span>
            )}

            {/* Desktop collapse button */}
            <button
              className="hidden lg:block btn btn-ghost btn-sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu size={20} />
            </button>

            {/* Mobile close button */}
            <button
              className="lg:hidden btn btn-ghost btn-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-2 mt-4 flex flex-col gap-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                    collapsed ? "lg:justify-center" : ""
                  } ${isActive && item.path !== "#logout" ? "bg-gray-200" : ""}`
                }
              >
                {item.icon}
                <span className={collapsed ? "lg:hidden" : ""}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col w-full lg:w-auto">
          {/* TOPBAR */}
          <header className="flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                className="lg:hidden btn btn-ghost btn-sm"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-base sm:text-lg">
                Admin Dashboard
              </span>
            </div>
          </header>

          {/* CONTENT AREA */}
          <main className="flex-1 p-3 sm:p-5 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;

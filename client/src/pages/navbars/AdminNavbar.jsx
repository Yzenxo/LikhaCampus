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
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";

const AdminNavbar = () => {
  const { showAlert } = useAlert();
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* SIDEBAR */}
        <aside
          className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!collapsed && (
              <span className="font-bold text-lg">LikhaCampus</span>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="flex-1 px-2 mt-4 flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => handleLogout(e, item)}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                    collapsed ? "justify-center" : ""
                  } ${isActive && item.path !== "#logout" ? "bg-gray-200" : ""}`
                }
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
          {/* TOPBAR */}
          <header className="flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">Admin Dashboard</span>
            </div>
          </header>

          {/* CONTENT AREA */}
          <main className="flex-1 p-5 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;

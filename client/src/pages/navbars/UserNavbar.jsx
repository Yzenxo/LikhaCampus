import axios from "axios";
import { useContext } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import default_avatar from "../../assets/default_avatar.jpg";
import NotificationDropdown from "../../components/User/NotificationDropdown";
import { UserContext } from "../../context/UserContext";
import { useAlert } from "../../hooks/useAlert";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  const isHomePage = location.pathname === "/home";

  const isPublicProfilePage = location.pathname.startsWith("/profile/");

  const logoutUser = async () => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const isVisitor = !user;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="navbar shadow-sm sticky top-0 z-50 bg-gradient-to-br from-blue-50 to-purple-50">
          {/* LEFT LOGO W/ HAMBRGR */}
          <div className="navbar-start">
            {/* HAMBRGR TOGGLE on mobile - only for logged in users */}
            {!isVisitor && (
              <div className="dropdown">
                <button tabIndex={0} className="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <NavLink to="/home">Home</NavLink>
                  </li>
                  <li>
                    <NavLink to="/forum">LikHow</NavLink>
                  </li>
                  <li>
                    <NavLink to="/projects">Projects</NavLink>
                  </li>
                  <li>
                    <NavLink to="/skills">Skills</NavLink>
                  </li>
                </ul>
              </div>
            )}

            <NavLink
              to={isVisitor ? "/login" : "/home"}
              className="btn btn-ghost font-bold text-lg"
            >
              LikhaCampus
            </NavLink>
          </div>

          {/* CENTER - only show for logged in users */}
          {!isVisitor && (
            <div className="navbar-center hidden lg:flex">
              <ul className="flex gap-4">
                <li>
                  <NavLink
                    to="/home"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded hover:bg-gray-100 transition-colors ${
                        isActive
                          ? "bg-gray-200 font-semibold text-gray-800"
                          : "text-gray-700"
                      }`
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/forum"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded hover:bg-gray-100 transition-colors ${
                        isActive
                          ? "bg-gray-200 font-semibold text-gray-800"
                          : "text-gray-700"
                      }`
                    }
                  >
                    LikHow
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded hover:bg-gray-100 transition-colors ${
                        isActive
                          ? "bg-gray-200 font-semibold text-gray-800"
                          : "text-gray-700"
                      }`
                    }
                  >
                    Projects
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/skills"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded hover:bg-gray-100 transition-colors ${
                        isActive
                          ? "bg-gray-200 font-semibold text-gray-800"
                          : "text-gray-700"
                      }`
                    }
                  >
                    Skills
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          {/* RIGHT */}
          <div className="navbar-end gap-5 pr-4">
            {isVisitor ? (
              // Visitor view - show login/signup buttons
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="btn btn-ghost btn-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              // Logged-in user view
              <>
                {/* FOR NOTIFICATIONS */}
                <NotificationDropdown />

                {/* FOR PROFILE */}
                <div className="dropdown dropdown-end">
                  <div className="flex items-center">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-circle avatar"
                    >
                      <div className="w-10 rounded-full">
                        <img
                          alt="user avatar"
                          src={user.avatar?.url || default_avatar}
                        />
                      </div>
                    </div>
                    <span className="hidden lg:inline-block font-medium ml-5">
                      {user.firstName}
                    </span>
                  </div>

                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <NavLink to="/profile" className="justify-between">
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/settings" className="justify-between">
                        Settings
                      </NavLink>
                    </li>
                    <li>
                      <a onClick={logoutUser}>Logout</a>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div
          className={`flex-1 flex flex-col items-center px-4 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 ${isHomePage ? "p-0" : "py-6"}`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default UserNavbar;

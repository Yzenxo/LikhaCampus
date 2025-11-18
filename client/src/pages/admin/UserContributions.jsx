import axios from "axios";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContributions = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("projects");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/contributions/stats", {
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "projects":
        return b.stats.projectCount - a.stats.projectCount;
      case "posts":
        return b.stats.forumPostCount - a.stats.forumPostCount;
      case "joined":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "recent":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const filteredUsers = sortedUsers.filter((user) => {
    if (filterRole === "all") return true;
    return user.role === filterRole;
  });

  const getMedal = (index) => {
    if (sortBy === "joined" || sortBy === "recent") return index + 1;
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return index + 1;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const totalProjects = users.reduce((sum, u) => sum + u.stats.projectCount, 0);
  const totalPosts = users.reduce((sum, u) => sum + u.stats.forumPostCount, 0);
  const activeUsers = users.filter((u) => !u.isBanned).length;

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <Users size={24} /> User Contributions
          </h2>
          <p className="text-gray-600">
            Track top contributors and platform engagement statistics
          </p>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{users.length}</div>
            <div className="stat-desc">{activeUsers} active</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value text-secondary">{totalProjects}</div>
            <div className="stat-desc">All time</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Total Forum Posts</div>
            <div className="stat-value text-accent">{totalPosts}</div>
            <div className="stat-desc">All time</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-title">Avg per User</div>
            <div className="stat-value text-info">
              {users.length > 0 ? Math.round(totalProjects / users.length) : 0}
            </div>
            <div className="stat-desc">projects</div>
          </div>
        </div>

        {/* FILTERS AND SORT */}
        <div className="flex flex-wrap gap-4 mb-6 bg-base-100 p-4 rounded-lg shadow">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Sort by</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="projects">Most Projects</option>
              <option value="posts">Most Forum Posts</option>
              <option value="joined">Oldest Members</option>
              <option value="recent">Newest Members</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Filter by Role</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">Users Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
        </div>

        {/* LEADERBOARD TABLE */}
        <div className="card bg-base-100 shadow-md overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Projects</th>
                <th>Forum Posts</th>
                <th>Total Activity</th>
                <th>Member Since</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {filterRole !== "all"
                      ? `No ${filterRole}s found`
                      : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    {/* RANK */}
                    <td className="font-bold text-lg">{getMedal(index)}</td>

                    {/* USER INFO */}
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <img
                              src={
                                user.avatar?.url ||
                                `https://ui-avatars.com/api/?name=${user.firstName}`
                              }
                              alt={user.firstName}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PROJECTS */}
                    <td>
                      <span className="badge badge-sm badge-primary">
                        {user.stats.projectCount}
                      </span>
                    </td>

                    {/* FORUM POSTS */}
                    <td>
                      <span className="badge badge-sm badge-secondary">
                        {user.stats.forumPostCount}
                      </span>
                    </td>

                    {/* TOTAL ACTIVITY */}
                    <td>
                      <span className="font-semibold">
                        {user.stats.projectCount + user.stats.forumPostCount}
                      </span>
                    </td>

                    {/* JOIN DATE */}
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                    {/* STATUS */}
                    <td>
                      {user.isBanned ? (
                        <span className="badge badge-sm badge-error">
                          Banned
                        </span>
                      ) : (
                        <span className="badge badge-sm badge-success">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* INFO BOX */}
        <div className="mt-6 alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Tip:</strong> Use this leaderboard to identify top
            contributors for featured artist selection or community recognition!
          </span>
        </div>
      </div>
    </>
  );
};

export default UserContributions;

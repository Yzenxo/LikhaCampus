import axios from "axios";
import { Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const UserRoleManagement = () => {
  const { showAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/users", {
        withCredentials: true,
      });

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert(
        error.response?.data?.message || "Failed to load users",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);

    try {
      const response = await axios.patch(
        `/admin/users/${userId}/role`,
        { role: newRole },
        {
          withCredentials: true,
        }
      );

      setUsers(users.map((u) => (u._id === userId ? response.data.user : u)));

      showAlert(`Role updated to ${newRole}`, "success");
    } catch (error) {
      console.error("Error updating role:", error);
      showAlert(
        error.response?.data?.error || "Failed to update role",
        "error"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} /> User Role Management
          </h2>
          <div className="badge bg-yellow">{users.length} Total Users</div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search users by name, email, or username..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* STATS */}
        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{users.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Admins</div>
            <div className="stat-value text-secondary">
              {users.filter((u) => u.role === "admin").length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Regular Users</div>
            <div className="stat-value">
              {users.filter((u) => u.role === "user").length}
            </div>
          </div>
        </div>

        {/* USER TABLE */}
        <div className="card bg-base-100 shadow-md overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Student Number</th>
                <th>Year Level</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? "No users found matching your search"
                      : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={
                                user.avatar?.url ||
                                "https://ui-avatars.com/api/?name=" +
                                  user.firstName
                              }
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm opacity-50">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.studentNumber}</td>
                    <td>{user.yearLevel}</td>
                    <td>
                      <select
                        className={`select select-sm select-bordered ${
                          user.role === "admin"
                            ? "select-secondary"
                            : "select-primary"
                        }`}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        disabled={updatingUserId === user._id}
                      >
                        <option value="user">
                          {updatingUserId === user._id ? "Updating..." : "User"}
                        </option>
                        <option value="admin">
                          {updatingUserId === user._id
                            ? "Updating..."
                            : "Admin"}
                        </option>
                      </select>
                      {user.role === "admin" && (
                        <Shield
                          className="inline ml-2 text-secondary"
                          size={16}
                        />
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserRoleManagement;

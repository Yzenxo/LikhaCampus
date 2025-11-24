import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/default_avatar.jpg";
import { useAlert } from "../../hooks/useAlert";

const UserViolations = () => {
  const { showAlert } = useAlert();
  const tabs = ["Pending Reports", "Warnings", "Suspended", "Banned"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [suspensionDuration, setSuspensionDuration] = useState(24);
  const [timer, setTimer] = useState(0); // triggers re-render for countdown

  useEffect(() => {
    fetchReportedUsers();
    const interval = setInterval(() => setTimer((t) => t + 1), 60000); // re-render every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReportedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/reported-users", {
        withCredentials: true,
      });
      setReportedUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching violation users:", error);
      showAlert("Failed to load violation users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissReports = async (userId) => {
    try {
      setActionLoading(userId);
      await axios.post(
        `/admin/users/${userId}/dismiss-reports`,
        {},
        { withCredentials: true }
      );
      showAlert("Reports dismissed successfully", "success");
      fetchReportedUsers();
    } catch (error) {
      console.error(error);
      showAlert(
        error.response?.data?.error || "Failed to dismiss reports",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleTakeAction = async () => {
    if (!actionModal || !selectedAction || !actionReason.trim()) {
      showAlert("Please select an action and provide a reason", "warning");
      return;
    }

    try {
      setIsProcessing(true);
      await axios.post(
        `/admin/users/${actionModal}/take-action`,
        {
          action: selectedAction,
          reason: actionReason,
          duration:
            selectedAction === "suspend" ? suspensionDuration : undefined,
        },
        { withCredentials: true }
      );

      showAlert("Action taken successfully", "success");
      fetchReportedUsers();
      setActionModal(null);
      setSelectedAction("");
      setActionReason("");
      setSuspensionDuration(24);
    } catch (error) {
      console.error(error);
      showAlert(
        error.response?.data?.error || "Failed to take action",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Returns remaining time for suspension or temporary ban
  const getRemainingTime = (user, type = "suspension") => {
    const dateKey = type === "suspension" ? "suspensionDate" : "banDate";
    const durationKey =
      type === "suspension" ? "suspensionDuration" : "banDuration";

    if (!user[dateKey] || !user[durationKey]) return null;
    const now = new Date();
    const end = new Date(user[dateKey]);
    end.setHours(end.getHours() + user[durationKey]);

    const remainingMs = end - now;
    if (remainingMs <= 0) return 0;

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const handleUnSuspend = async (userId) => {
    try {
      setActionLoading(userId);
      await axios.patch(`/admin/users/${userId}/un-suspend`, {
        withCredentials: true,
      });
      showAlert("User has been un-suspended", "success");
      fetchReportedUsers();
    } catch (err) {
      console.error(err);
      showAlert("Failed to un-suspend user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = reportedUsers.filter((user) => {
    switch (activeTab) {
      case "Pending Reports":
        return user.reports?.some((r) => r.status === "pending");
      case "Warnings":
        return user.warnings?.length > 0;
      case "Suspended":
        return user.isSuspended;
      case "Banned":
        return user.isBanned;
      default:
        return false;
    }
  });

  const renderUser = (user) => {
    const isLoading = actionLoading === user._id;
    const pendingReports =
      user.reports?.filter((r) => r.status === "pending") || [];
    const suspensionRemaining = getRemainingTime(user, "suspension");
    const banRemaining = getRemainingTime(user, "ban");

    return (
      <div key={user._id} className="card bg-base-100 shadow-md p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar?.url || defaultAvatar}
              alt={user.firstName}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="font-bold text-lg">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          {activeTab === "Pending Reports" && (
            <div className="badge badge-error badge-lg">
              {pendingReports.length} Reports
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="font-semibold">Student #:</span>{" "}
            {user.studentNumber}
          </div>
          <div>
            <span className="font-semibold">Year Level:</span> {user.yearLevel}
          </div>
        </div>

        {activeTab === "Pending Reports" && pendingReports.length > 0 && (
          <div className="card bg-base-200 p-3 rounded-lg mb-3">
            <p className="font-semibold text-sm mb-3">Pending Reports:</p>
            {pendingReports.map((report, idx) => (
              <div
                key={idx}
                className="bg-base-100 p-3 rounded-lg mb-2 border border-base-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-sm badge-ghost">
                    Report #{idx + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    by {report.reportedBy?.firstName}{" "}
                    {report.reportedBy?.lastName} (@
                    {report.reportedBy?.username})
                  </span>
                </div>
                <p className="text-sm text-gray-800">
                  <strong>Reason:</strong> {report.reason}
                </p>
                {report.details && (
                  <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                    "{report.details}"
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(report.reportedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {(activeTab === "Suspended" || activeTab === "Banned") && (
          <div className="mb-2">
            {activeTab === "Suspended" && (
              <>
                <p>
                  <strong>Suspension Reason:</strong> {user.suspensionReason}
                </p>
                <p className="text-xs text-gray-500">
                  Suspended on {new Date(user.suspensionDate).toLocaleString()}
                </p>
                {suspensionRemaining ? (
                  <p className="text-xs text-gray-500">
                    Remaining: {suspensionRemaining.hours}h{" "}
                    {suspensionRemaining.minutes}m
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Suspension ended</p>
                )}
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => handleUnSuspend(user._id)}
                >
                  Un-suspend
                </button>
              </>
            )}
            {activeTab === "Banned" && (
              <>
                <p>
                  <strong>Ban Reason:</strong> {user.banReason}
                </p>
                <p className="text-xs text-gray-500">
                  Banned on {new Date(user.banDate).toLocaleString()}
                </p>
                {banRemaining && (
                  <p className="text-xs text-gray-500">
                    Remaining: {banRemaining.hours}h {banRemaining.minutes}m
                  </p>
                )}
                {!banRemaining && (
                  <p className="text-xs text-gray-500">
                    {user.banDuration ? "Ban ended" : "Permanent ban"}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "Pending Reports" && (
          <div className="flex gap-2">
            <button
              className="btn btn-outline btn-sm flex-1"
              onClick={() => handleDismissReports(user._id)}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Dismiss Reports"}
            </button>
            <button
              className="btn btn-error btn-sm flex-1"
              onClick={() => setActionModal(user._id)}
              disabled={isLoading}
            >
              Take Action
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-3 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
          <AlertTriangle size={24} /> User Violations
        </h2>
      </div>

      <div className="tabs mb-4">
        {tabs.map((tab) => {
          const count = reportedUsers.filter((user) => {
            switch (tab) {
              case "Pending Reports":
                return user.reports?.some((r) => r.status === "pending");
              case "Warnings":
                return user.warnings?.length > 0;
              case "Suspended":
                return user.isSuspended;
              case "Banned":
                return user.isBanned;
            }
          }).length;
          return (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No users in "{activeTab}"
        </p>
      ) : (
        filteredUsers.map((user) => renderUser(user))
      )}

      {selectedAction === "suspend" && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Suspension Duration (hours)
            </span>
          </label>
          <input
            type="number"
            min={1}
            className="input input-bordered w-full"
            value={suspensionDuration}
            onChange={(e) => setSuspensionDuration(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};

export default UserViolations;

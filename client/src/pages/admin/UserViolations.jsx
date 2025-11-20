import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/default_avatar.jpg";
import { useAlert } from "../../hooks/useAlert";

const UserViolations = () => {
  const { showAlert } = useAlert();
  const [reportedUsers, setReportedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReportedUsers();
  }, []);

  const fetchReportedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/reported-users", {
        withCredentials: true,
      });

      setReportedUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching reported users:", error);
      showAlert("Failed to load reported users", "error");
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
      setReportedUsers(reportedUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Error dismissing reports:", error);
      showAlert(
        error.response?.data?.error || "Failed to dismiss reports",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleTakeAction = async () => {
    if (!actionModal || !selectedAction) {
      showAlert("Please select an action", "warning");
      return;
    }

    if (!actionReason.trim()) {
      showAlert("Please provide a reason", "warning");
      return;
    }

    try {
      setIsProcessing(true);
      await axios.post(
        `/admin/users/${actionModal}/take-action`,
        {
          action: selectedAction,
          reason: actionReason,
        },
        { withCredentials: true }
      );

      showAlert("Action taken successfully", "success");
      setReportedUsers(reportedUsers.filter((u) => u._id !== actionModal));
      setActionModal(null);
      setSelectedAction("");
      setActionReason("");
    } catch (error) {
      console.error("Error taking action:", error);
      showAlert(
        error.response?.data?.error || "Failed to take action",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUser = (user) => {
    const isLoading = actionLoading === user._id;
    const pendingReports = user.reports.filter((r) => r.status === "pending");

    return (
      <div key={user._id} className="card bg-base-100 shadow-md p-4 mb-4">
        {/* HEADER */}
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

          {/* STATUS BADGE */}
          <div className="badge badge-error badge-lg">
            {pendingReports.length} Reports
          </div>
        </div>

        {/* USER INFO */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="font-semibold">Student #:</span>{" "}
            {user.studentNumber}
          </div>
          <div>
            <span className="font-semibold">Year Level:</span> {user.yearLevel}
          </div>
        </div>

        {/* REPORTS LIST */}
        <div className="card bg-base-200 p-3 rounded-lg mb-3">
          <p className="font-semibold text-sm mb-3">Pending Reports:</p>

          {pendingReports.map((report, idx) => (
            <div
              key={idx}
              className="bg-base-100 p-3 rounded-lg mb-2 border border-base-300"
            >
              {/* REPORTER INFO */}
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

              {/* REASON */}
              <div className="mb-2">
                <span className="font-semibold text-xs text-gray-600">
                  Reason:
                </span>
                <p className="text-sm text-gray-800">{report.reason}</p>
              </div>

              {/* DETAILS */}
              {report.details && (
                <div className="mb-2">
                  <span className="font-semibold text-xs text-gray-600">
                    Details:
                  </span>
                  <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                    "{report.details}"
                  </p>
                </div>
              )}

              {/* DATE */}
              <div className="text-xs text-gray-400">
                {new Date(report.reportedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
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
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <AlertTriangle size={24} /> User Reports
          </h2>
          <p className="text-gray-600">
            Review users with 3 or more pending reports
          </p>
        </div>

        {/* STATS */}
        <div className="stats bg-white shadow mb-6">
          <div className="stat">
            <div className="stat-title">Users Flagged for Review</div>
            <div className="stat-value text-error">{reportedUsers.length}</div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* USERS LIST */}
            {reportedUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No users flagged for review</p>
              </div>
            ) : (
              reportedUsers.map((user) => renderUser(user))
            )}
          </>
        )}
      </div>

      {/* ACTION MODAL */}
      {actionModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-error mb-4">
              Take Action Against User
            </h3>

            <div className="space-y-4">
              {/* ACTION SELECT */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Select Action *
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <option value="">Choose an action...</option>
                  <option value="warning">Issue Warning Only</option>
                  <option value="suspend">Suspend Account (Temporary)</option>
                  <option value="ban">Permanent Ban</option>
                </select>
              </div>

              {/* REASON */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Reason *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  placeholder="Explain why you're taking this action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  maxLength={500}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {actionReason.length}/500 characters
                  </span>
                </label>
              </div>

              {/* ACTION DESCRIPTIONS */}
              {selectedAction && (
                <div className="alert alert-warning">
                  <div className="text-sm">
                    {selectedAction === "warning" && (
                      <p>
                        <strong>Warning:</strong> User will receive a warning
                        email. Reports will be marked as reviewed.
                      </p>
                    )}
                    {selectedAction === "suspend" && (
                      <p>
                        <strong>Suspension:</strong> User account will be
                        temporarily suspended. They cannot log in until
                        reactivated by admin.
                      </p>
                    )}
                    {selectedAction === "ban" && (
                      <p>
                        <strong>Permanent Ban:</strong> User account will be
                        permanently banned. This action cannot be undone easily.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setActionModal(null);
                  setSelectedAction("");
                  setActionReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleTakeAction}
                disabled={
                  !selectedAction || !actionReason.trim() || isProcessing
                }
              >
                {isProcessing ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setActionModal(null);
              setSelectedAction("");
              setActionReason("");
            }}
          ></div>
        </dialog>
      )}
    </>
  );
};

export default UserViolations;

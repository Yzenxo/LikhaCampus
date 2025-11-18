import axios from "axios";
import { useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const EllipsisReport = ({
  type,
  targetId,
  isOwner,
  onDelete,
  onEdit,
  postId,
  onMenuClick,
}) => {
  const { showAlert } = useAlert();
  const [modal, setModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const getEndpoints = () => {
    if (type === "Post") {
      return {
        delete: `/forum/posts/${targetId}`,
        report: `/forum/posts/${targetId}/report`,
        edit: `/forum/edit/${targetId}`,
      };
    } else if (type === "Project") {
      return {
        delete: `/projects/${targetId}`,
        edit: `/projects/edit/${targetId}`,
        report: `/projects/${targetId}/report`,
        archives: `/projects/${targetId}/archive`,
      };
    } else if (type === "Comment") {
      return {
        delete: `/forum/posts/${postId}/comments/${targetId}`,
        report: `/forum/comments/${targetId}/report`,
      };
    } else if (type === "User") {
      return {
        report: `/user/${targetId}/report`,
      };
    }
    return null;
  };

  const endpoints = getEndpoints();

  const handleReport = async () => {
    if (!reportReason) {
      showAlert("Please select a reason.", "warning");
      return;
    }

    try {
      if (type === "Post" || type === "Comment") {
        await axios.post(
          endpoints.report,
          { reason: reportReason, details: reportDetails },
          { withCredentials: true }
        );

        showAlert(`${type} reported and hidden for review!`, "success");
        setModal(null);
        setReportReason("");
        setReportDetails("");

        if (onDelete) {
          onDelete(targetId);
        }
      } else if (type === "Project") {
        await axios.post(
          `/projects/${targetId}/report`,
          { reason: reportReason, details: reportDetails },
          { withCredentials: true }
        );

        showAlert("Project reported successfully!", "success");
        setModal(null);
        setReportReason("");
        setReportDetails("");

        if (onDelete) {
          onDelete(targetId);
        }
      } else if (type === "User") {
        await axios.post(
          endpoints.report,
          { reason: reportReason, details: reportDetails },
          { withCredentials: true }
        );

        showAlert("User reported successfully!", "success");
        setModal(null);
        setReportReason("");
        setReportDetails("");
      } else {
        await axios.post(
          "/reports",
          {
            targetId,
            targetType: type,
            reason: reportReason,
            details: reportDetails,
          },
          { withCredentials: true }
        );

        showAlert("Report submitted successfully!", "success");
        setModal(null);
        setReportReason("");
        setReportDetails("");
      }
    } catch (error) {
      console.error("Error reporting: ", error);
      showAlert(
        error.response?.data?.error || "Failed to submit report.",
        "error"
      );
    }
  };

  const handleDelete = async () => {
    if (!endpoints) {
      showAlert("Cannot delete: Invalid configuration.", "error");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(endpoints.delete, {
        withCredentials: true,
      });

      showAlert(`${type} deleted successfully!`, "success");
      setModal(null);

      if (onDelete) {
        onDelete(targetId);
      }
    } catch (error) {
      console.error("Error deleting: ", error);
      showAlert(
        "Failed to delete: " + (error.response?.data?.error || error.message),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      setModal(null);
    }
  };

  const handleArchive = async () => {
    if (type !== "Project") return;

    setIsArchiving(true);

    try {
      await axios.patch(
        endpoints.archives,
        {},
        {
          withCredentials: true,
        }
      );

      showAlert("Project archived successfully!", "success");
      setModal(null);

      if (onDelete) {
        onDelete(targetId);
      }
    } catch (error) {
      console.error("Error archiving: ", error);
      showAlert(
        error.response?.data?.error || "Failed to archive project.",
        "error"
      );
    } finally {
      setIsArchiving(false);
    }
  };

  const isProject = type === "Project";
  const isPost = type === "Post";

  const handleMenuItemClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div onClick={onMenuClick}>
        {/* ELLIPSIS DROPDOWN */}
        <div
          className="dropdown dropdown-end"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            tabIndex={0}
            className="btn btn-sm btn-outline border-black bg-base-100"
          >
            ⋮
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box shadow z-[1] w-40"
          >
            {isOwner ? (
              <>
                <li>
                  <button
                    onClick={(e) => {
                      handleMenuItemClick(e);
                      handleEdit();
                    }}
                  >
                    Edit
                  </button>
                </li>
                {isProject && (
                  <li>
                    <button
                      onClick={(e) => {
                        handleMenuItemClick(e);
                        setModal("archive");
                      }}
                    >
                      Archive
                    </button>
                  </li>
                )}
                {!isProject && (
                  <li>
                    <button
                      onClick={(e) => {
                        handleMenuItemClick(e);
                        setModal("delete");
                      }}
                    >
                      Delete
                    </button>
                  </li>
                )}
              </>
            ) : (
              <li>
                <button
                  onClick={(e) => {
                    handleMenuItemClick(e);
                    setModal("report");
                  }}
                >
                  Report
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* REPORT MODAL */}
        {modal === "report" && (
          <div className="modal modal-open" onClick={handleMenuItemClick}>
            <div className="modal-box" onClick={handleMenuItemClick}>
              <h3 className="font-bold">Report {type}</h3>
              <p className="py-2">Why are you reporting this?</p>
              <select
                className="select select-bordered w-full"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                onClick={handleMenuItemClick}
              >
                <option value="">Select a reason</option>
                <option value="Bullying, harassment, or abuse">
                  Bullying, harassment, or abuse
                </option>
                <option value="Suicide or self-harm">
                  Suicide or self-harm
                </option>
                <option value="Violent, hateful, or disturbing content">
                  Violent, hateful, or disturbing content
                </option>
                <option value="Selling or promoting restricted items">
                  Selling or promoting restricted items
                </option>
                <option value="Spam or irrelevant content">
                  Spam or irrelevant content
                </option>
                <option value="Scam or false information">
                  Scam or false information
                </option>
                <option value="Inappropriate content">
                  Inappropriate content
                </option>
                <option value="Plagiarism">Plagiarism</option>
              </select>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-sm">
                    Additional details (optional)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Provide more context about why you're reporting this..."
                  rows="3"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  onClick={handleMenuItemClick}
                  maxLength={500}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {reportDetails.length}/500 characters
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  className="btn"
                  onClick={(e) => {
                    handleMenuItemClick(e);
                    setModal(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={(e) => {
                    handleMenuItemClick(e);
                    handleReport();
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={(e) => {
                handleMenuItemClick(e);
                setModal(null);
              }}
            />
          </div>
        )}

        {/* DELETE MODAL */}
        {modal === "delete" && (
          <div className="modal modal-open">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-error">Delete {type}</h3>
              <p className="py-2">
                Are you sure you want to delete this {type.toLowerCase()}?{" "}
                <span className="font-bold text-error">
                  This action cannot be undone!
                </span>
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => setModal(null)}
            ></div>
          </div>
        )}

        {/* ARCHIVE MODAL */}
        {modal === "archive" && (
          <div className="modal modal-open">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold">Archive Project</h3>
              <p className="py-2">
                Are you sure you want to archive this project? You can unarchive
                it later.
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleArchive}
                  disabled={isArchiving}
                >
                  {isArchiving ? "Archiving..." : "Archive"}
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => setModal(null)}
            ></div>
          </div>
        )}
      </div>
    </>
  );
};

export default EllipsisReport;

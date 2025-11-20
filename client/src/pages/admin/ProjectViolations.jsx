import axios from "axios";
import { FolderX } from "lucide-react";
import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/default_avatar.jpg";
import { useAlert } from "../../hooks/useAlert";

const ProjectViolations = () => {
  const { showAlert } = useAlert();
  const [reportedProjects, setReportedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReportedProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/projects/admin/reported", {
        withCredentials: true,
      });

      setReportedProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching reported projects:", error);
      showAlert("Failed to load reported projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedProjects();
  }, []);

  const handleRestoreProject = async (projectId) => {
    try {
      setActionLoading(projectId);
      await axios.post(
        `/projects/admin/${projectId}/restore`,
        {},
        { withCredentials: true }
      );

      showAlert("Project restored successfully", "success");
      setReportedProjects(reportedProjects.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error restoring project:", error);
      showAlert(
        error.response?.data?.error || "Failed to restore project",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteModal) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/projects/admin/${deleteModal}/delete`, {
        withCredentials: true,
      });

      showAlert("Project deleted permanently", "success");
      setReportedProjects(
        reportedProjects.filter((p) => p._id !== deleteModal)
      );
      setDeleteModal(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      showAlert(
        error.response?.data?.error || "Failed to delete project",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderProject = (project) => {
    const isLoading = actionLoading === project._id;

    return (
      <div key={project._id} className="card bg-base-100 shadow-md p-4 mb-4">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <img
              src={project.author?.avatar?.url || defaultAvatar}
              alt={project.author?.firstName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">
                {project.author?.firstName} {project.author?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                @{project.author?.username}
              </p>
            </div>
          </div>

          {/* STATUS BADGE */}
          <div className="badge badge-error">
            {project.moderation.status === "hidden" ? "Hidden" : "Reported"}
          </div>
        </div>

        {/* PROJECT THUMBNAIL */}
        {project.thumbnail && (
          <div className="mb-3">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* CONTENT */}
        <h3 className="font-bold text-lg mb-2 whitespace-pre-wrap line-clamp-3">
          {project.title}
        </h3>
        <p className="text-sm mb-2 whitespace-pre-wrap line-clamp-3">
          {project.description}
        </p>

        {/* PROJECT INFO */}
        <div className="flex gap-2 mb-3">
          <span className="badge badge-primary">{project.skill}</span>
          <span className="badge badge-secondary">{project.category}</span>
        </div>

        {/* MODERATION INFO */}
        <div className="card bg-base-200 p-3 rounded-lg mb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Total Reports:</span>{" "}
              {project.moderation.reports?.length || 0}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span className="capitalize">{project.moderation.status}</span>
            </div>
          </div>

          {/* USER REPORTS */}
          {project.moderation.reports &&
            project.moderation.reports.length > 0 && (
              <div className="mt-3 pt-3 border-t border-base-300">
                <p className="font-semibold text-sm mb-2">User Reports:</p>
                {project.moderation.reports.map((report, idx) => (
                  <div
                    key={idx}
                    className="bg-base-100 p-3 rounded-lg mb-2 border border-base-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-sm badge-ghost">
                        {report.userId?.firstName} {report.userId?.lastName}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="font-semibold text-xs text-gray-600">
                        Reason:
                      </span>
                      <p className="text-sm text-gray-800">{report.reason}</p>
                    </div>

                    {report.details && (
                      <div>
                        <span className="font-semibold text-xs text-gray-600">
                          Details:
                        </span>
                        <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                          "{report.details}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-primary btn-sm flex-1"
            onClick={() => handleRestoreProject(project._id)}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Restore"}
          </button>
          <button
            className="btn btn-outline btn-error btn-sm flex-1"
            onClick={() => setDeleteModal(project._id)}
            disabled={isLoading}
          >
            Delete
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
            <FolderX size={24} /> Project Violations
          </h2>
          <p className="text-gray-600">Review and moderate reported projects</p>
        </div>

        {/* STATS */}
        <div className="stats bg-white shadow mb-6">
          <div className="stat">
            <div className="stat-title">Total Reported Projects</div>
            <div className="stat-value text-error">
              {reportedProjects.length}
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* PROJECTS LIST */}
            {reportedProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reported projects to review</p>
              </div>
            ) : (
              reportedProjects.map((project) => renderProject(project))
            )}
          </>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="modal modal-open">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-error">Delete Project</h3>
            <p className="py-2">
              Are you sure you want to permanently delete this project?{" "}
              <span className="font-bold text-error">
                This action cannot be undone!
              </span>
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeleteModal(null)}
          ></div>
        </div>
      )}
    </>
  );
};

export default ProjectViolations;

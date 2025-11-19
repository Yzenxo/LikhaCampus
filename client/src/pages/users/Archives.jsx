import axios from "axios";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext.js";
import { useAlert } from "../../hooks/useAlert.js";

const Archives = () => {
  const { User: currentUser } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [selectedProject, setSelectedProject] = useState(null);
  const [modal, setModal] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedProjects();
  }, []);

  useEffect(() => {
    if (modal) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [modal]);

  const fetchArchivedProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/projects/archived", {
        withCredentials: true,
      });

      setArchivedProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching archived projects: ", error);
      showAlert(
        error.response?.data?.message || "Failed to fetch archived projects",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedProject) return;

    try {
      setIsRestoring(true);
      await axios.patch(
        `/projects/${selectedProject._id}/restore`,
        {},
        {
          withCredentials: true,
        }
      );

      showAlert("Project restored successfully!", "success");
      setArchivedProjects(
        archivedProjects.filter((p) => p._id !== selectedProject._id)
      );
      setModal(null);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error restoring project: ", error);
      showAlert(
        error.response?.data?.message || "Failed to restore project",
        "error"
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/projects/${selectedProject._id}`, {
        withCredentials: true,
      });

      showAlert("Project deleted permanently!", "success");
      setArchivedProjects(
        archivedProjects.filter((p) => p._id !== selectedProject._id)
      );
      setModal(null);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error deleting project: ", error);
      showAlert(
        error.response?.data?.message || "Failed to delete project",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold">ARCHIVES</h1>

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* INFO CARD */}
        <div className="alert alert-info mb-6 bg-royal-blue">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-white">
            Archived projects are hidden from your profile and the public
            gallery. You can restore or permanently delete them here.
          </span>
        </div>

        {/* PROJECTS LIST */}
        {archivedProjects.length === 0 ? (
          <div className="card bg-base-100 shadow-sm p-12 text-center">
            <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No archived projects</p>
            <p className="text-sm text-gray-400 mt-2">
              Projects you archive will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {archivedProjects.map((project) => (
              <div key={project._id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* THUMBNAIL */}
                    <div className="w-full md:w-48 h-32 bg-base-200 rounded-lg overflow-hidden flex-shrink-0">
                      {project.images?.[0]?.url ? (
                        <img
                          src={project.images[0].url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : project.videos?.[0]?.thumbnail ? (
                        <img
                          src={project.videos[0].thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Archive className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <h3 className="card-title text-xl mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-royal-blue text-white badge-sm">
                          {project.skill}
                        </span>
                        <span className="badge bg-yellow badge-sm">
                          {project.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Archived on{" "}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setModal("restore");
                        }}
                        className="btn btn-outline btn-primary btn-sm gap-2 flex-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setModal("delete");
                        }}
                        className="btn btn-outline btn-error btn-sm gap-2 flex-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESTORE MODAL */}
      {modal === "restore" && (
        <div className="modal modal-open">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Restore Project</h3>
            <p className="py-2">
              Are you sure you want to restore "{selectedProject?.title}"? It
              will appear in your profile again.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRestore}
                disabled={isRestoring}
              >
                {isRestoring ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModal(null)}></div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && (
        <div className="modal modal-open">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-error">Permanently Delete Project</h3>
            <p className="py-2">
              Are you sure you want to permanently delete "
              {selectedProject?.title}"?{" "}
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
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModal(null)}></div>
        </div>
      )}
    </>
  );
};

export default Archives;

import axios from "axios";
import { Eye, Folder, FolderOpen, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const ProjectManagementPanel = () => {
  const { showAlert } = useAlert();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/projects", {
        withCredentials: true,
      });

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert(
        error.response?.data?.message || "Failed to load projects",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (project) => {
    setSelectedProject(project);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
    setSelectedProject(null);
  };

  const skillsAndCategories = useMemo(() => {
    const skillsMap = {};

    projects.forEach((project) => {
      if (project.skill && project.category) {
        if (!skillsMap[project.skill]) {
          skillsMap[project.skill] = new Set();
        }
        skillsMap[project.skill].add(project.category);
      }
    });

    const result = {};
    Object.keys(skillsMap).forEach((skill) => {
      result[skill] = Array.from(skillsMap[skill]);
    });

    return result;
  }, [projects]);

  const clearSkillFilter = () => {
    setFilterSkill("");
    setFilterCategory("");
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.author?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      project.author?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      project.author?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesSkill = !filterSkill || project.skill === filterSkill;
    const matchesCategory =
      !filterCategory || project.category === filterCategory;

    return matchesSearch && matchesSkill && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <Folder size={24} /> Uploaded Projects
          </h2>
          <p className="text-gray-600">
            Showcase user-submitted works and track their project activity on
            the platform
          </p>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search projects by title or author..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* SKILL FILTER */}
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Filter by Skill & Category</h3>
                {(filterSkill || filterCategory) && (
                  <button
                    className="btn btn-sm btn-ghost gap-2"
                    onClick={clearSkillFilter}
                  >
                    <X size={16} />
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="w-full flex flex-col md:flex-row gap-3">
                {/* SKILL SELECT */}
                <select
                  className="select select-primary"
                  value={filterSkill}
                  onChange={(e) => {
                    const skill = e.target.value;
                    setFilterSkill(skill);
                    setFilterCategory(
                      skill && skillsAndCategories[skill]?.[0]
                        ? skillsAndCategories[skill][0]
                        : ""
                    );
                  }}
                >
                  <option value="">All Skills</option>
                  {Object.keys(skillsAndCategories)
                    .sort()
                    .map((skill) => (
                      <option key={skill} value={skill}>
                        {skill} ({skillsAndCategories[skill].length})
                      </option>
                    ))}
                </select>

                {/* CATEGORY SELECT */}
                {filterSkill && skillsAndCategories[filterSkill] && (
                  <select
                    className="select select-secondary"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {skillsAndCategories[filterSkill].sort().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {(filterSkill || filterCategory) && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {filterSkill && (
                    <span className="badge badge-primary whitespace-nowrap max-w-max inline-flex items-center px-3">
                      {filterSkill}
                    </span>
                  )}
                  {filterCategory && (
                    <span className="badge badge-secondary whitespace-nowrap max-w-max inline-flex items-center px-3">
                      {filterCategory}
                    </span>
                  )}
                </div>
              )}

              {Object.keys(skillsAndCategories).length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No projects found with skills/categories
                </p>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats bg-white shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value text-primary">{projects.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Filtered Results</div>
            <div className="stat-value text-secondary">
              {filteredProjects.length}
            </div>
          </div>
        </div>

        {/* PROJECTS TABLE */}
        <div className="card bg-base-100 shadow-md overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Author</th>
                <th>Skill</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {searchTerm || filterSkill || filterCategory
                      ? "No projects found matching your filters"
                      : "No projects found"}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id}>
                    <td>
                      <div className="w-16 h-16 bg-base-200 rounded overflow-hidden">
                        {project.images?.[0]?.url ? (
                          <img
                            src={project.images[0].url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="font-medium">
                      <div className="max-w-xs truncate" title={project.title}>
                        {project.title}
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <img
                              src={
                                project.author?.avatar?.url ||
                                `https://ui-avatars.com/api/?name=${project.author?.firstName}`
                              }
                              alt={project.author?.firstName}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm break-words whitespace-pre-wrap">
                            {project.author?.firstName}{" "}
                            {project.author?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 break-words whitespace-pre-wrap">
                            @{project.author?.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-sm badge-primary whitespace-nowrap max-w-max inline-flex items-center px-3">
                        {project.skill}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-sm badge-secondary whitespace-nowrap max-w-max inline-flex items-center px-3">
                        {project.category}
                      </span>
                    </td>

                    <td>{new Date(project.createdAt).toLocaleDateString()}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-ghost gap-2"
                        onClick={() => handleQuickView(project)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {showQuickView && selectedProject && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-2xl break-words whitespace-pre-wrap">
                  {selectedProject.title}
                </h3>

                <div className="flex items-center gap-2 mt-2">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={
                          selectedProject.author?.avatar?.url ||
                          `https://ui-avatars.com/api/?name=${selectedProject.author?.firstName}`
                        }
                        alt={selectedProject.author?.firstName}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold break-words whitespace-pre-wrap">
                      {selectedProject.author?.firstName}{" "}
                      {selectedProject.author?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 break-words whitespace-pre-wrap">
                      @{selectedProject.author?.username}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeQuickView}
              >
                <X size={20} />
              </button>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-primary whitespace-nowrap max-w-max inline-flex items-center px-3">
                {selectedProject.skill}
              </span>
              <span className="badge badge-secondary whitespace-nowrap max-w-max inline-flex items-center px-3">
                {selectedProject.category}
              </span>
              <span className="badge badge-outline whitespace-nowrap max-w-max inline-flex items-center px-3">
                {new Date(selectedProject.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* IMAGES */}
            {selectedProject.images && selectedProject.images.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Images</h4>

                <div className="flex gap-4 overflow-x-auto p-2 rounded-box bg-base-200">
                  {selectedProject.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-auto max-w-full"
                    >
                      <img
                        src={image.url}
                        alt={`Project image ${index + 1}`}
                        className="h-72 md:h-96 object-contain rounded-box"
                      />
                    </div>
                  ))}
                </div>

                {/* Scroll hint */}
                {selectedProject.images.length > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Swipe / Scroll horizontally to view more images →
                  </p>
                )}
              </div>
            )}

            {/* VIDEOS */}
            {selectedProject.videos && selectedProject.videos.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Videos</h4>
                <div className="space-y-2">
                  {selectedProject.videos.map((video, index) => (
                    <video
                      key={index}
                      controls
                      className="w-full rounded-box max-h-96"
                    >
                      <source src={video.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="break-words whitespace-pre-wrap text-sm">
                {selectedProject.description}
              </p>
            </div>

            {/* TAGGED USERS */}
            {selectedProject.taggedUsers &&
              selectedProject.taggedUsers.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Tagged Users</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.taggedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="badge badge-lg gap-2 p-3 whitespace-nowrap max-w-max inline-flex items-center"
                      >
                        <div className="avatar">
                          <div className="w-6 h-6 rounded-full">
                            <img
                              src={
                                user.avatar?.url ||
                                `https://ui-avatars.com/api/?name=${user.firstName}`
                              }
                              alt={user.firstName}
                            />
                          </div>
                        </div>
                        <span>@{user.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* MODAL ACTIONS */}
            <div className="modal-action">
              <button className="btn" onClick={closeQuickView}>
                Close
              </button>
            </div>
          </div>

          <div className="modal-backdrop" onClick={closeQuickView}></div>
        </dialog>
      )}
    </>
  );
};

export default ProjectManagementPanel;

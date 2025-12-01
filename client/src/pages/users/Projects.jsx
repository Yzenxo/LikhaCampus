import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { ProjectCard } from "../../components/User/ProjectCards";
import SkillDropdown from "../../components/User/SkillDropdown";
import UploadProjectModal from "../../components/User/UploadProjectModal.jsx";
import { UserContext } from "../../context/UserContext";
import { useScrollToHash } from "../../hooks/useScrollToHash.js";

const Projects = () => {
  useScrollToHash();
  const { user: currentUser } = useContext(UserContext);
  const [projects, setProjects] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalProjects: 0,
    hasMore: false,
  });
  const projectsPerPage = 12;

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSkill, selectedCategory, searchQuery]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/projects", {
        params: {
          page: currentPage,
          limit: projectsPerPage,
          skill: selectedSkill || undefined,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
        },
        withCredentials: true,
      });

      setProjects(response.data.projects || []);
      setFilteredProjects(response.data.projects || []);
      setPagination(
        response.data.pagination || {
          totalPages: 1,
          totalProjects: 0,
          hasMore: false,
        }
      );
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...projects];

    if (selectedSkill) {
      filtered = filtered.filter((p) => p.skill === selectedSkill);
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [selectedSkill, selectedCategory, searchQuery, projects]);

  const handleSkillSelect = (skill, category) => {
    setSelectedSkill(skill);
    setSelectedCategory(category);
  };

  const handleDeleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
    setFilteredProjects((prev) => prev.filter((p) => p._id !== projectId));
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects((prev) =>
      prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
    );
    setFilteredProjects((prev) =>
      prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
    );
  };

  const handleClearFilters = () => {
    setSelectedSkill("");
    setSelectedCategory("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg">
          Loading projects...
        </span>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold royal-blue">PROJECTS</h1>

      <div className="container mx-auto mt-4 max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {filteredProjects.length} projects (Page {currentPage} of{" "}
            {pagination.totalPages})
            {pagination.totalProjects > 0 &&
              ` • ${pagination.totalProjects} total`}
          </div>
          {/* CTA FOR UPLOAD PROJECT */}
          {currentUser && (
            <button
              className="btn btn-primary"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Project
            </button>
          )}
        </div>

        {/* FILTER SECTION & SEARCH BAR */}
        <div className="card bg-base-100 shadow-sm p-4 min-h-[100px] mt-3">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* SKILL/ CAT DROPDOWN */}
            <div className="flex-1">
              <SkillDropdown
                selectedSkill={selectedSkill}
                selectedCategory={selectedCategory}
                onSelect={handleSkillSelect}
              />
            </div>

            <div className="hidden sm:block sm:flex-1"></div>

            {/* SEARCH BAR */}
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* CLEAR FILTERS */}
            {(selectedSkill || selectedCategory || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="btn btn-outline btn-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* ACTIVE FILTERS DISPLAY */}
          {(selectedSkill || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSkill && (
                <span className="badge badge-primary gap-2">
                  {selectedSkill}
                  <button
                    onClick={() => {
                      setSelectedSkill("");
                      setSelectedCategory("");
                    }}
                    className="text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="badge badge-secondary gap-2">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* PROJECTS GRID */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mt-5">
            <div className="text-gray-400 mb-2">
              {searchQuery || selectedSkill ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery || selectedSkill
                ? "No projects found"
                : "No projects available yet"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchQuery || selectedSkill
                ? "Try adjusting your filters or search terms"
                : "Be the first to upload a project!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  currentUser={currentUser}
                  profileUserId={null}
                  onDelete={handleDeleteProject}
                  onUpdate={handleUpdateProject}
                  loading={false}
                />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-6">
                <button
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)]
                    .map((_, idx) => idx + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1) ||
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      );
                    })
                    .map((page) => {
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="btn btn-sm btn-ghost btn-disabled"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          className={`btn btn-sm ${
                            currentPage === page ? "btn-primary" : "btn-ghost"
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                <button
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
        <UploadProjectModal
          show={isUploadModalOpen}
          onHide={() => setIsUploadModalOpen(false)}
          onSave={() => {
            setIsUploadModalOpen(false);
            fetchProjects();
          }}
        />
      </div>
    </>
  );
};

export default Projects;

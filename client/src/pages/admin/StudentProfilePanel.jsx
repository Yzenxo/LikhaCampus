import axios from "axios";
import {
  Award,
  Eye,
  Folder,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const StudentProfilePanel = () => {
  const { showAlert } = useAlert();
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    fetchStudentProfiles();
  }, [filterSkill, filterCategory]);

  const fetchStudentProfiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSkill) params.skill = filterSkill;
      if (filterCategory) params.category = filterCategory;

      const response = await axios.get("/admin/student-profiles", {
        params,
        withCredentials: true,
      });

      setStudentProfiles(response.data.studentProfiles || []);
      setAvailableSkills(response.data.filters.availableSkills || []);
      setAvailableCategories(response.data.filters.availableCategories || []);
    } catch (error) {
      console.error("Error fetching student profiles:", error);
      showAlert(
        error.response?.data?.message || "Failed to load student profiles",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate expertise level based on performance in a category
  const getExpertiseLevel = (projectCount, avgUpvotes) => {
    const score = projectCount * 10 + avgUpvotes * 5;

    if (score >= 100)
      return { level: "Master", color: "badge-error", icon: "🏆" };
    if (score >= 50)
      return { level: "Expert", color: "badge-warning", icon: "⭐" };
    if (score >= 20)
      return { level: "Proficient", color: "badge-info", icon: "📘" };
    return { level: "Developing", color: "badge-ghost", icon: "🌱" };
  };

  // Identify student's specialty (primary category they excel in)
  const getStudentSpecialty = (profile) => {
    // Group projects by category
    const categoryData = {};

    profile.projects.forEach((project) => {
      if (!categoryData[project.category]) {
        categoryData[project.category] = {
          count: 0,
          totalUpvotes: 0,
          projects: [],
        };
      }
      categoryData[project.category].count++;
      categoryData[project.category].totalUpvotes += project.upvoteCount || 0;
      categoryData[project.category].projects.push(project);
    });

    // Calculate score for each category (quantity + quality)
    const categoryScores = Object.entries(categoryData).map(
      ([category, data]) => {
        const avgUpvotes = data.count > 0 ? data.totalUpvotes / data.count : 0;
        const score = data.count * 10 + avgUpvotes * 5;

        return {
          category,
          projectCount: data.count,
          totalUpvotes: data.totalUpvotes,
          avgUpvotes: Math.round(avgUpvotes * 10) / 10,
          score,
          expertise: getExpertiseLevel(data.count, avgUpvotes),
        };
      }
    );

    // Sort by score to find primary specialty
    categoryScores.sort((a, b) => b.score - a.score);
    const primarySpecialty = categoryScores[0];

    return {
      primaryCategory: primarySpecialty.category,
      projectCount: primarySpecialty.projectCount,
      totalUpvotes: primarySpecialty.totalUpvotes,
      avgUpvotes: primarySpecialty.avgUpvotes,
      expertise: primarySpecialty.expertise,
      label: `${primarySpecialty.expertise.level} ${primarySpecialty.category}`,
      allCategories: categoryScores,
    };
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  const clearFilters = () => {
    setFilterSkill("");
    setFilterCategory("");
    setFilterExpertise("");
  };

  const filteredProfiles = studentProfiles.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      profile.user.firstName?.toLowerCase().includes(searchLower) ||
      profile.user.lastName?.toLowerCase().includes(searchLower) ||
      profile.user.username?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Filter by expertise level
    if (filterExpertise) {
      const specialty = getStudentSpecialty(profile);
      if (specialty.expertise.level !== filterExpertise) return false;
    }

    return true;
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
            <Users size={24} /> Student Profiles & Specialty Identification
          </h2>
          <p className="text-gray-600">
            Identify students who excel in specific categories
          </p>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search students by name or username..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* FILTER CARD */}
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Filter Students</h3>
                {(filterSkill || filterCategory || filterExpertise) && (
                  <button
                    className="btn btn-sm btn-ghost gap-2"
                    onClick={clearFilters}
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* SKILL LEVEL SELECT (Beginner/Intermediate/Advanced) */}
                <select
                  className="select select-primary"
                  value={filterSkill}
                  onChange={(e) => {
                    setFilterSkill(e.target.value);
                    setFilterCategory("");
                  }}
                >
                  <option value="">All Skill Levels</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                {/* CATEGORY SELECT (Arts/Photography/Welding, etc) */}
                <select
                  className="select select-secondary"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  disabled={!filterSkill}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* EXPERTISE FILTER (Master/Expert/Proficient/Developing) */}
                <select
                  className="select select-accent"
                  value={filterExpertise}
                  onChange={(e) => setFilterExpertise(e.target.value)}
                >
                  <option value="">All Expertise Levels</option>
                  <option value="Master">🏆 Master</option>
                  <option value="Expert">⭐ Expert</option>
                  <option value="Proficient">📘 Proficient</option>
                  <option value="Developing">🌱 Developing</option>
                </select>
              </div>

              {(filterSkill || filterCategory || filterExpertise) && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {filterSkill && (
                    <span className="badge badge-primary whitespace-nowrap max-w-max inline-flex items-center px-3">
                      Skill: {filterSkill}
                    </span>
                  )}
                  {filterCategory && (
                    <span className="badge badge-secondary whitespace-nowrap max-w-max inline-flex items-center px-3">
                      Category: {filterCategory}
                    </span>
                  )}
                  {filterExpertise && (
                    <span className="badge badge-accent whitespace-nowrap max-w-max inline-flex items-center px-3">
                      Expertise: {filterExpertise}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats bg-white shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Students</div>
            <div className="stat-value text-primary">
              {filteredProfiles.length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value text-secondary">
              {filteredProfiles.reduce((sum, p) => sum + p.totalProjects, 0)}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Masters</div>
            <div className="stat-value text-error">
              {
                filteredProfiles.filter(
                  (p) => getStudentSpecialty(p).expertise.level === "Master"
                ).length
              }
            </div>
          </div>
        </div>

        {/* STUDENT PROFILES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchTerm || filterSkill || filterCategory || filterExpertise
                ? "No students found matching your filters"
                : "No students found"}
            </div>
          ) : (
            filteredProfiles.map((profile) => {
              const specialty = getStudentSpecialty(profile);

              return (
                <div
                  key={profile.user._id}
                  className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="card-body">
                    {/* USER INFO */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={
                              profile.user.avatar?.url ||
                              `https://ui-avatars.com/api/?name=${profile.user.firstName}`
                            }
                            alt={profile.user.firstName}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {profile.user.firstName} {profile.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          @{profile.user.username}
                        </p>
                      </div>
                    </div>

                    {/* SPECIALTY IDENTIFICATION LABEL */}
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">
                          SPECIALTY
                        </span>
                        <span className="text-2xl">
                          {specialty.expertise.icon}
                        </span>
                      </div>
                      <div
                        className={`badge ${specialty.expertise.color} badge-lg w-full justify-center gap-2 py-3`}
                      >
                        <Target size={16} />
                        <span className="font-bold">{specialty.label}</span>
                      </div>
                      <div className="text-xs text-center mt-1 text-gray-600">
                        in {specialty.primaryCategory}
                      </div>
                    </div>

                    {/* DETAILED STATS */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="bg-base-200 p-2 rounded">
                        <div className="text-xs text-gray-500">
                          Projects in {specialty.primaryCategory}
                        </div>
                        <div className="font-bold text-primary">
                          {specialty.projectCount}
                        </div>
                      </div>
                      <div className="bg-base-200 p-2 rounded">
                        <div className="text-xs text-gray-500">
                          Avg. Upvotes
                        </div>
                        <div className="font-bold text-secondary">
                          {specialty.avgUpvotes}
                        </div>
                      </div>
                      <div className="bg-base-200 p-2 rounded">
                        <div className="text-xs text-gray-500">
                          Total Projects
                        </div>
                        <div className="font-bold">{profile.totalProjects}</div>
                      </div>
                      <div className="bg-base-200 p-2 rounded">
                        <div className="text-xs text-gray-500">
                          Total Upvotes
                        </div>
                        <div className="font-bold text-accent">
                          {specialty.totalUpvotes}
                        </div>
                      </div>
                    </div>

                    {/* CATEGORIES BADGES */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {specialty.allCategories.slice(0, 3).map((cat) => (
                        <span
                          key={cat.category}
                          className="badge badge-sm badge-outline"
                        >
                          {cat.category} ({cat.projectCount})
                        </span>
                      ))}
                      {specialty.allCategories.length > 3 && (
                        <span className="badge badge-sm badge-ghost">
                          +{specialty.allCategories.length - 3}
                        </span>
                      )}
                    </div>

                    {/* PROJECT THUMBNAILS */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {profile.projects.slice(0, 3).map((project) => (
                        <div
                          key={project._id}
                          className="aspect-square bg-base-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleViewProject(project)}
                        >
                          {project.thumbnail ? (
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Folder className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>
                      ))}
                      {profile.totalProjects > 3 && (
                        <div className="aspect-square bg-base-200 rounded flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            +{profile.totalProjects - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* VIEW BUTTON */}
                    <button
                      className="btn btn-primary btn-sm gap-2 w-full"
                      onClick={() => handleViewStudent(profile)}
                    >
                      <Eye size={16} />
                      View Full Portfolio
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STUDENT DETAILS MODAL */}
      {showDetailsModal && selectedStudent && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        selectedStudent.user.avatar?.url ||
                        `https://ui-avatars.com/api/?name=${selectedStudent.user.firstName}`
                      }
                      alt={selectedStudent.user.firstName}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-2xl">
                    {selectedStudent.user.firstName}{" "}
                    {selectedStudent.user.lastName}
                  </h3>
                  <p className="text-gray-500">
                    @{selectedStudent.user.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.user.email}
                  </p>

                  {/* Specialty Label in Modal */}
                  <div className="mt-2">
                    {(() => {
                      const specialty = getStudentSpecialty(selectedStudent);
                      return (
                        <div
                          className={`badge ${specialty.expertise.color} gap-2`}
                        >
                          <span>{specialty.expertise.icon}</span>
                          <span>{specialty.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeDetailsModal}
              >
                <X size={20} />
              </button>
            </div>

            {/* COMPREHENSIVE STATS */}
            <div className="stats shadow mb-4 w-full">
              <div className="stat">
                <div className="stat-title">Total Projects</div>
                <div className="stat-value text-primary">
                  {selectedStudent.totalProjects}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Upvotes</div>
                <div className="stat-value text-secondary">
                  {selectedStudent.projects.reduce(
                    (sum, p) => sum + (p.upvoteCount || 0),
                    0
                  )}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Categories</div>
                <div className="stat-value text-accent">
                  {
                    new Set(selectedStudent.projects.map((p) => p.category))
                      .size
                  }
                </div>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN */}
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={20} />
              Category Performance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {(() => {
                const specialty = getStudentSpecialty(selectedStudent);
                return specialty.allCategories.map((cat) => (
                  <div
                    key={cat.category}
                    className="card bg-base-200 shadow-sm"
                  >
                    <div className="card-body p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold">{cat.category}</h5>
                        <div
                          className={`badge ${cat.expertise.color} badge-sm gap-1`}
                        >
                          {cat.expertise.icon} {cat.expertise.level}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Projects</div>
                          <div className="font-bold">{cat.projectCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Upvotes</div>
                          <div className="font-bold">{cat.totalUpvotes}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg</div>
                          <div className="font-bold">{cat.avgUpvotes}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* PROJECTS LIST */}
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Trophy size={20} />
              Project Portfolio
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStudent.projects.map((project) => (
                <div
                  key={project._id}
                  className="card bg-base-100 shadow cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleViewProject(project)}
                >
                  <figure className="h-48 bg-base-200">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="text-gray-400" size={48} />
                      </div>
                    )}
                  </figure>
                  <div className="card-body p-4">
                    <h5 className="card-title text-base">{project.title}</h5>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="badge badge-primary badge-sm">
                        {project.skill}
                      </span>
                      <span className="badge badge-secondary badge-sm">
                        {project.category}
                      </span>
                      <span className="badge badge-ghost badge-sm gap-1">
                        <Award size={12} />
                        {project.upvoteCount || 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeDetailsModal}></div>
        </dialog>
      )}

      {/* PROJECT DETAILS MODAL */}
      {showProjectModal && selectedProject && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-2xl">{selectedProject.title}</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeProjectModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="badge badge-primary">
                {selectedProject.skill}
              </span>
              <span className="badge badge-secondary">
                {selectedProject.category}
              </span>
              <span className="badge badge-ghost gap-1">
                <Award size={14} />
                {selectedProject.upvoteCount || 0} upvotes
              </span>
              <span className="badge badge-outline">
                {new Date(selectedProject.createdAt).toLocaleDateString()}
              </span>
            </div>

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
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm whitespace-pre-wrap">
                {selectedProject.description}
              </p>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeProjectModal}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeProjectModal}></div>
        </dialog>
      )}
    </>
  );
};

export default StudentProfilePanel;

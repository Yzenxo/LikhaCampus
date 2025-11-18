import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileCard from "../../components/User/ProfileCard";
import ProfileSidebar from "../../components/User/ProfileSidebar";
import ProjectCards from "../../components/User/ProjectCards";
import UploadProjectModal from "../../components/User/UploadProjectModal";
import { UserContext } from "../../context/UserContext";
import { useAlert } from "../../hooks/useAlert.js";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user: currentUser } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [taggedProjects, setTaggedProjects] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [taggedLoading, setTaggedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");

  const handleOpenModal = (modalName) => setActiveModal(modalName);
  const handleCloseModal = () => setActiveModal(null);

  useEffect(() => {
    if (!username && currentUser?.username) {
      navigate(`/profile/${currentUser.username}`, { replace: true });
    }
  }, [username, currentUser, navigate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setProjectsLoading(true);

        const endpoint = username
          ? `/user/profile/${username}`
          : "/user/profile";

        const profileResponse = await axios.get(endpoint, {
          withCredentials: !username,
          timeout: 10000,
        });

        setProfile(profileResponse.data.user);
        setLoading(false);

        const profileUserId = profileResponse.data.user._id;
        const isOwnProfile = currentUser?._id === profileUserId;

        // Fetch projects (public or authenticated based on your backend setup)
        const projectsEndpoint = `/projects/user/${profileUserId}`;
        try {
          const projectsResponse = await axios.get(projectsEndpoint, {
            withCredentials: isOwnProfile, // Only send credentials if viewing own profile
            timeout: 10000,
          });
          setProjects(projectsResponse.data.projects || []);
        } catch (error) {
          console.error("Error fetching projects:", error);
          setProjects([]); // Set empty if failed
        }
        setProjectsLoading(false);

        // Only fetch tagged projects if user is authenticated
        if (currentUser) {
          setTaggedLoading(true);
          try {
            const taggedEndpoint = `/projects/tagged/${profileUserId}`;
            const taggedResponse = await axios.get(taggedEndpoint, {
              withCredentials: true,
              timeout: 10000,
            });
            setTaggedProjects(taggedResponse.data.projects || []);
          } catch (error) {
            console.error("Error fetching tagged projects:", error);
            setTaggedProjects([]);
          }
          setTaggedLoading(false);
        } else {
          setTaggedProjects([]);
          setTaggedLoading(false);
        }

        // Only fetch forum posts if user is authenticated
        if (currentUser) {
          try {
            const forumPostsEndpoint = `/forum/posts/user/${profileUserId}`;
            const forumPostsResponse = await axios.get(forumPostsEndpoint, {
              withCredentials: true,
              timeout: 10000,
            });
            setForumPosts(forumPostsResponse.data.posts || []);
          } catch (error) {
            console.error("Error fetching forum posts:", error);
            setForumPosts([]);
          }
        } else {
          setForumPosts([]);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching profile: ", error);
        setError(error.response?.data?.error || "Failed to load profile.");
        setLoading(false);
        setProjectsLoading(false);
        setTaggedLoading(false);
      }
    };

    if (username || !currentUser) {
      fetchProfileData();
    }
  }, [username, currentUser]);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!profile?._id) {
        setAssessment(null);
        return;
      }

      if (!profile.hasAssessment) {
        setAssessment(null);
        return;
      }

      try {
        const response = await axios.get(`/assessment/${profile._id}`, {
          withCredentials: true,
        });

        setAssessment(response.data.assessment);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        setAssessment(null);
      }
    };
    if (profile) fetchAssessment();
  }, [profile]);

  const handleUploadProject = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    handleCloseModal();
  };

  const handleDeleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
    setTaggedProjects((prev) => prev.filter((p) => p._id !== projectId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-warning max-w-md">
          <span>Profile not found</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-4 max-w-5xl">
        <div className="px-2 md:px-2 lg:px-4 py-6 max-w-7xl mx-auto">
          {/* PROFILE CARD (includes header image) */}
          <ProfileCard
            name={`${profile.firstName} ${profile.lastName}`}
            bio={profile.bio || "Set your bio"}
            avatar={profile.avatar}
            username={profile.username}
            userId={profile._id}
            assessment={assessment}
            projects={projects}
            forumPostCount={forumPosts?.length || 0}
            onUpload={() => handleOpenModal("uploadProject")}
            isOwnProfile={currentUser?._id === profile._id}
            headerImage={profile.headerImage}
          />

          {/* TWO COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-4">
              <ProfileSidebar
                assessment={assessment}
                projects={projects}
                forumPostCount={forumPosts?.length || 0}
                user={profile}
              />
            </div>

            {/* RIGHT CONTENT */}
            <div className="lg:col-span-8">
              {/* TABS */}
              <div className="border-b border-base-300 mb-6">
                <div className="flex gap-8">
                  <button
                    className={`pb-4 px-2 font-semibold transition-colors relative cursor-pointer ${
                      activeTab === "projects"
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("projects")}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Projects
                      {projects.length > 0 && (
                        <span className="text-xs bg-base-300 px-2 py-0.5 rounded-full">
                          {projects.length}
                        </span>
                      )}
                    </span>
                    {activeTab === "projects" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>

                  <button
                    className={`pb-4 px-2 font-semibold transition-colors relative cursor-pointer ${
                      activeTab === "tagged"
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("tagged")}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tagged
                      {taggedProjects.length > 0 && (
                        <span className="text-xs bg-base-300 px-2 py-0.5 rounded-full">
                          {taggedProjects.length}
                        </span>
                      )}
                    </span>
                    {activeTab === "tagged" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                </div>
              </div>

              {/* TAB CONTENT */}
              {activeTab === "projects" ? (
                <ProjectCards
                  projects={projects}
                  currentUser={currentUser}
                  profileUserId={profile._id}
                  onDelete={handleDeleteProject}
                  loading={projectsLoading}
                />
              ) : (
                <ProjectCards
                  projects={taggedProjects}
                  currentUser={currentUser}
                  profileUserId={profile._id}
                  onDelete={handleDeleteProject}
                  loading={taggedLoading}
                  emptyMessage="No tagged projects yet"
                />
              )}
            </div>
          </div>

          {/* UPLOAD PROJECT MODAL */}
          {currentUser?._id === profile._id && (
            <UploadProjectModal
              show={activeModal === "uploadProject"}
              onHide={handleCloseModal}
              onSave={handleUploadProject}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;

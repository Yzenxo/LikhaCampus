import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";
import EllipsisReport from "../../components/User/EllipsisReport.jsx";
import EditProjectModal from "./EditProjectModal.jsx";

const ProjectCards = ({
  projects,
  currentUser,
  profileUserId,
  onDelete,
  onUpdate,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          currentUser={currentUser}
          profileUserId={profileUserId}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

const ProjectCard = ({
  project,
  currentUser,
  profileUserId,
  onDelete,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localProject, setLocalProject] = useState(project);

  const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return null;

    if (videoUrl.includes("cloudinary.com") && videoUrl.includes("/video/")) {
      const thumbnailUrl = videoUrl
        .replace("/video/upload/", "/video/upload/so_0,w_400,h_300,c_fill/")
        .replace(/\.[^.]+$/, ".jpg");
      return thumbnailUrl;
    }
    return videoUrl;
  };

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const author = localProject.author || {
    firstName: "Unknown",
    lastName: "User",
    username: "unknown",
    avatar: null,
  };

  const allMedia = [
    ...(localProject.images || []).map((img) => ({ ...img, type: "image" })),
    ...(localProject.videos || []).map((vid) => ({ ...vid, type: "video" })),
  ];

  const thumbnail =
    localProject.thumbnail ||
    localProject.images?.[0]?.url ||
    (localProject.videos?.[0]?.url
      ? getVideoThumbnail(localProject.videos[0].url)
      : null) ||
    "https://via.placeholder.com/400x300?text=No+Image";

  const isVideo =
    localProject.videos?.length > 0 && !localProject.images?.length;

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) {
      return;
    }
    navigate(`/projects/${localProject._id}`);
  };

  const handleProjectUpdate = (updatedProject) => {
    setLocalProject(updatedProject);
    if (onUpdate) {
      onUpdate(updatedProject);
    }

    window.dispatchEvent(
      new CustomEvent("projectUpdated", {
        detail: updatedProject,
      })
    );
  };

  return (
    <>
      <div
        id={`project-${project._id}`}
        onClick={handleCardClick}
        className="card bg-base-100 shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
      >
        {/* HEADER: AUTHOR + ELLIPSIS */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                <img
                  src={author?.avatar?.url || defaultAvatar}
                  alt={`${author.firstName} ${author.lastName}`}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${author.username}`);
                  }}
                  className="text-primary hover:underline cursor-pointer"
                >
                  {author.firstName} {author.lastName}
                </button>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(localProject.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {project.updatedAt &&
                  new Date(project.updatedAt).getTime() !==
                    new Date(project.createdAt).getTime() && (
                    <span className="ml-1 text-xs italic">(Edited)</span>
                  )}
              </p>
            </div>
          </div>

          <EllipsisReport
            type="Project"
            targetId={localProject._id}
            isOwner={currentUser?._id === localProject.author?._id}
            onDelete={onDelete}
            onEdit={() => setIsEditModalOpen(true)}
          />
        </div>

        {/* THUMBNAIL/ MEDIA PREVIEW */}
        <div className="relative w-full h-96 bg-base-200">
          {isVideo ? (
            <div className="relative w-full h-full">
              <img
                src={thumbnail}
                alt={localProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="w-8 h-8 text-primary" fill="currentColor" />
                </div>
              </div>
            </div>
          ) : allMedia.length > 1 ? (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
              {allMedia.slice(0, 4).map((media, idx) => (
                <div key={idx} className="relative">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt={`${localProject.title} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={media.thumbnail || media.url}
                        alt={`${localProject.title} video`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-4 h-4 text-white" fill="white" />
                      </div>
                    </div>
                  )}
                  {idx === 3 && allMedia.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{allMedia.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <img
              src={thumbnail}
              alt={localProject.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* BODY */}
        <div className="p-4">
          {/* TITLE */}
          <h3 className="font-bold text-lg mb-1 line-clamp-1">
            {localProject.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {localProject.description}
          </p>

          {/* TAGGED USERS - UPDATE */}
          {localProject.taggedUsers && localProject.taggedUsers.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-gray-500">with</span>
                {localProject.taggedUsers.map((user, idx) => (
                  <span key={user._id} className="text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user.username}`);
                      }}
                      className="text-primary hover:underline font-semibold"
                    >
                      {user.firstName} {user.lastName}
                    </button>
                    {idx < localProject.taggedUsers.length - 1 && (
                      <span className="text-gray-500">, </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SKILL & CATEGORY BADGES */}
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-royal-blue text-white badge-sm">
              {localProject.skill}
            </span>
            <span className="badge bg-yellow badge-sm">
              {localProject.category}
            </span>{" "}
          </div>
        </div>
      </div>

      {/* EDIT PROJECT MODAL */}
      <EditProjectModal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        project={localProject}
        onUpdate={handleProjectUpdate}
      />
    </>
  );
};

export default ProjectCards;
export { ProjectCard };

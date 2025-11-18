import axios from "axios";
import { ArrowLeft, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";

const ViewProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/projects/${projectId}`, {
          withCredentials: true,
        });

        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleProjectUpdate = (event) => {
      setProject(event.detail);
    };

    window.addEventListener("projectUpdated", handleProjectUpdate);

    return () => {
      window.removeEventListener("projectUpdated", handleProjectUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <p className="text-error">Error: {error || "Project not found"}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const allMedia = [
    ...(project.images || []).map((img) => ({
      ...img,
      type: "image",
      uniqueId: `img-${img._id || img.url}`,
    })),
    ...(project.videos || []).map((vid) => ({
      ...vid,
      type: "video",
      uniqueId: `vid-${vid._id || vid.url}`,
    })),
  ];

  const isVideo = project.videos?.length > 0 && !project.images?.length;

  const displayMedia =
    selectedMedia ||
    (() => {
      if (isVideo && project.videos?.[0]) {
        return {
          url: project.videos[0].url,
          type: "video",
          thumbnail: project.videos[0].thumbnail,
        };
      }

      return {
        url:
          project.thumbnail ||
          project.images?.[0]?.url ||
          "https://via.placeholder.com/800x600?text=No+Image",
        type: "image",
        thumbnail: null,
      };
    })();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 w-full">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm text-[#00017a] hover:bg-[#00017a] hover:text-white mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="card bg-base-100 shadow-lg w-full">
            <div className="card-body">
              {/* AUTHOR + TITLE + DESCRIPTION */}
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img
                        src={project.author?.avatar?.url || defaultAvatar}
                        alt={project.author?.firstName || "User"}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {project.author?.firstName} {project.author?.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {project.updatedAt &&
                        new Date(project.updatedAt).getTime() !==
                          new Date(project.createdAt).getTime() && (
                          <>
                            <span className="ml-1 italic">(Edited)</span>
                          </>
                        )}
                    </p>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-2 break-words">
                  {project.title}
                </h1>
                <p className="text-base text-gray-700 leading-relaxed mb-3 break-words">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge badge-m bg-royal-blue text-white">
                    {project.skill}
                  </span>
                  <span className="badge badge-m bg-yellow text-gray-800">
                    {project.category}
                  </span>
                </div>

                {/* TAGGED USERS - Now INSIDE the border section */}
                {project.taggedUsers && project.taggedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-500">
                      with{" "}
                      {project.taggedUsers.map((user, idx) => (
                        <span key={user._id}>
                          <button
                            onClick={() =>
                              navigate(`/profile/${user.username}`)
                            }
                            className="text-primary hover:underline font-semibold"
                          >
                            {user.firstName} {user.lastName}
                          </button>
                          {idx < project.taggedUsers.length - 1 && ", "}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>

              {/* MEDIA PREVIEW */}
              <figure className="rounded-xl overflow-hidden bg-base-300 mb-8">
                {displayMedia.type === "video" ? (
                  <div className="relative w-full">
                    {videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <span className="loading loading-spinner loading-lg text-white"></span>
                      </div>
                    )}
                    <video
                      src={displayMedia.url}
                      controls
                      className="w-full max-h-[32rem] object-contain"
                      poster={displayMedia.thumbnail}
                      preload="auto"
                      playsInline
                      controlsList="nodownload"
                      onLoadStart={() => setVideoLoading(true)}
                      onCanPlay={() => setVideoLoading(false)}
                      onWaiting={() => setVideoLoading(true)}
                      onPlaying={() => setVideoLoading(false)}
                      onError={(e) => {
                        setVideoLoading(false);
                        console.error("Video error:", e);
                        console.error("Video src:", displayMedia.url);
                      }}
                      onLoadedMetadata={(e) => {
                        console.log("Video duration:", e.target.duration);
                        console.log("Video ready state:", e.target.readyState);
                      }}
                      onProgress={(e) => {
                        const buffered = e.target.buffered;
                        if (buffered.length > 0) {
                          console.log(
                            "Buffered:",
                            (buffered.end(0) / e.target.duration) * 100 + "%"
                          );
                        }
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <img
                    src={displayMedia.url}
                    alt={project.title}
                    className="w-full max-h-[24rem] object-contain p-4"
                  />
                )}
              </figure>

              {project.details && (
                <>
                  <h3 className="font-bold text-lg mb-2">Details</h3>
                  <p className="text-gray-600 mb-8">{project.details}</p>
                </>
              )}

              {allMedia.length > 1 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allMedia.map((media, idx) => (
                      <div
                        key={media.uniqueId}
                        className="relative rounded-lg overflow-hidden h-32 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedMedia(media)}
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={`${project.title} - ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="relative w-full h-full bg-base-300">
                            <img
                              src={media.thumbnail || media.url}
                              alt={`Video ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play
                                className="w-6 h-6 text-white"
                                fill="white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProject;

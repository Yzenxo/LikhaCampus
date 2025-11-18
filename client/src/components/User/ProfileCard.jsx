import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";
import FeaturedArtistBadge from "../User/FeaturedArtistBadge.jsx";
import EllipsisReport from "./EllipsisReport.jsx";

const ProfileCard = ({
  name,
  bio,
  avatar,
  username,
  userId,
  onUpload,
  isOwnProfile,
  headerImage,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Default header image if none provided
  const defaultHeaderImage =
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920";

  return (
    <>
      {/* COVER/HEADER SECTION */}
      <div className="card shadow-md bg-base-100 mb-4 w-full">
        {/* HEADER IMAGE */}
        <div className="h-48 w-full rounded-t-lg relative overflow-hidden">
          <img
            src={headerImage?.url || defaultHeaderImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />

          {/* REPORT USER ELLIPSIS (Other's Profile) */}
          {!isOwnProfile && (
            <div className="absolute top-4 right-4">
              <EllipsisReport type="User" targetId={userId} isOwner={false} />
            </div>
          )}
        </div>

        {/* PROFILE CONTENT */}
        <div className="p-6 relative">
          {/* CENTERED AVATAR */}
          <div className="flex flex-col items-center -mt-20">
            <img
              src={avatar?.url || defaultAvatar}
              alt="Profile avatar"
              className="rounded-full w-32 h-32 md:w-36 md:h-36 object-cover border-4 border-base-100 shadow-xl relative z-10"
            />

            {/* NAME & USERNAME */}
            <div className="text-center mt-4">
              <h2 className="text-2xl md:text-3xl font-bold break-words">
                {name || "Your Name"}
              </h2>

              {/* FEATURED ARTIST BADGE */}
              <div className="flex justify-center">
                {userId && <FeaturedArtistBadge userId={userId} />}
              </div>

              {username && <p className="text-gray-600 mt-1">@{username}</p>}
            </div>

            {/* BIO */}
            <p className="text-gray-700 mt-3 max-w-2xl text-center break-words whitespace-pre-wrap">
              {bio || "No bio yet."}
            </p>

            {/* BUTTONS (Own Profile) */}
            {isOwnProfile && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                <button className="btn btn-primary" onClick={onUpload}>
                  Upload Project
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/archives")}
                >
                  Archives
                </button>
                <button
                  className="btn btn-outline btn-square"
                  onClick={handleCopyLink}
                  title="Copy profile link"
                >
                  {copied ? (
                    <Check size={20} className="text-success" />
                  ) : (
                    <Link2 size={20} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;

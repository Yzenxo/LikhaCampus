import { Check, Link2 } from "lucide-react"; // Add this import
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
  headerColor = "#5865F2",
  onHeaderColorChange,
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

  return (
    <>
      {/* COVER/HEADER SECTION */}
      <div className="card shadow-md bg-base-100 mb-4 w-full">
        {/* HEADER WITH COLOR PICKER */}
        <div
          className="h-48 w-full rounded-t-lg relative"
          style={{ backgroundColor: headerColor }}
        >
          {/* COLOR PICKER (Own Profile) */}
          {isOwnProfile && onHeaderColorChange && (
            <div className="absolute top-4 right-4">
              <label className="cursor-pointer" title="Change header color">
                <input
                  type="color"
                  value={headerColor}
                  onChange={(e) => onHeaderColorChange(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-lg hover:scale-110 transition"
                />
              </label>
            </div>
          )}

          {/* REPORT USER ELLIPSIS (Other's Profile) */}
          {!isOwnProfile && (
            <div className="absolute top-4 right-4">
              <EllipsisReport type="User" targetId={userId} isOwner={false} />
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="p-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 -mt-20 md:-mt-16">
            {/* AVATAR */}
            <img
              src={avatar?.url || defaultAvatar}
              alt="Profile avatar"
              className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover border-4 border-base-100 shadow-lg relative z-10"
            />

            {/* NAME/ BIO + BADGE */}
            <div className="flex-1 text-center md:text-left md:mt-16 min-w-0">
              <h2 className="text-2xl font-bold break-words whitespace-pre-wrap">
                {name || "Your Name"}
              </h2>

              {/* FEATURED ARTIST BADGE */}
              {userId && <FeaturedArtistBadge userId={userId} />}

              {username && <p className="text-gray-600">@{username}</p>}
              <p className="text-gray-700 mt-1 max-w-2xl break-words whitespace-pre-wrap">
                {bio || "No bio yet."}
              </p>
            </div>

            {/* BUTTONS */}
            {isOwnProfile && (
              <div className="flex flex-wrap gap-2 md:mt-16 justify-center md:justify-start shrink-0">
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

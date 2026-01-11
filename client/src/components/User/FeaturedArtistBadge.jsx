import axios from "axios";
import { useEffect, useState } from "react";

const FeaturedArtistBadge = ({ userId }) => {
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkFeaturedStatus = async () => {
      try {
        // Check if currently featured
        const currentResponse = await axios.get(
          `/featured-artist/check/${userId}`,
          {
            withCredentials: true,
          }
        );

        // Also get user achievements for historical badges
        const userResponse = await axios.get(`/user/id/${userId}`, {
          withCredentials: true,
        });

        const isCurrent = currentResponse.data.isFeatured;
        const achievements =
          userResponse.data.user?.achievements?.featuredArtist || [];

        if (isCurrent) {
          setBadgeData({
            type: "current",
            data: currentResponse.data.featuredData,
          });
        } else if (achievements.length > 0) {
          // Show "Former Featured Artist" if they were featured before
          const mostRecent = achievements[achievements.length - 1];
          setBadgeData({
            type: "former",
            count: achievements.length,
            lastAwarded: mostRecent.awardedAt,
          });
        } else {
          setBadgeData(null);
        }
      } catch (error) {
        console.error("Error checking featured status:", error);
        setBadgeData(null);
      } finally {
        setLoading(false);
      }
    };

    checkFeaturedStatus();
  }, [userId]);

  if (loading || !badgeData) return null;

  // Current Featured Artist Badge
  if (badgeData.type === "current") {
    return (
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-2.5 py-1 rounded-full text-xs font-bold shadow-lg mt-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 animate-pulse"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>Featured Artist of the Week</span>
      </div>
    );
  }

  // Former Featured Artist Badge
  if (badgeData.type === "former") {
    return (
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold mt-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>
          Featured Artist {badgeData.count > 1 ? `(${badgeData.count}x)` : ""}
        </span>
      </div>
    );
  }

  return null;
};

export default FeaturedArtistBadge;

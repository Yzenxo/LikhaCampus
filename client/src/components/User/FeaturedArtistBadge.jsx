import axios from "axios";
import { useEffect, useState } from "react";

const FeaturedArtistBadge = ({ userId }) => {
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkFeaturedStatus = async () => {
      try {
        const response = await axios.get(`/featured-artist/check/${userId}`, {
          withCredentials: true,
        });
        setIsFeatured(response.data.isFeatured);
      } catch (error) {
        console.error("Error checking featured status:", error);
        setIsFeatured(false);
      } finally {
        setLoading(false);
      }
    };

    checkFeaturedStatus();
  }, [userId]);

  if (loading || !isFeatured) return null;

  return (
    <>
      <div className="inline-flex items-center gap-1.5 bg-[#ffde00] text-black px-2 py-0.5 rounded text-xs font-semibold mt-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>Featured Artist of the Week</span>
      </div>
    </>
  );
};

export default FeaturedArtistBadge;

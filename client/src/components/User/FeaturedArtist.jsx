import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";

const FeaturedArtist = () => {
  const navigate = useNavigate();
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedArtist();
  }, []);

  const fetchFeaturedArtist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/featured-artist/current`, {
        withCredentials: true,
      });

      setFeaturedArtist(response.data.featuredArtist);
    } catch (err) {
      if (
        err.response?.status === 404 ||
        err.response?.data?.message?.includes("No featured artist")
      ) {
        setFeaturedArtist(null);
      } else {
        setError("Failed to load featured artist");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card bg-gradient-to-br from-[#00017a] to-[#0002b3] shadow-lg p-6">
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-md text-white"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!featuredArtist) {
    return (
      <div className="card bg-gradient-to-br from-[#00017a] to-[#0002b3] shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 className="text-xl font-bold text-white">
            Featured Artist of the Week
          </h3>
        </div>
        <p className="text-white/80 text-center py-4">
          No featured artist this week. Check back next Monday!
        </p>
      </div>
    );
  }

  const { user, projectCount, startDate, endDate } = featuredArtist;

  return (
    <>
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-400 text-[#00017a] px-3 py-1.5 rounded-full font-semibold text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Artist
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#00017a]">
            This Week's Spotlight
          </h2>
        </div>
      </div>

      {/* COMPACT FEATURED CARD */}
      <div className="relative bg-gradient-to-br from-[#00017a] via-[#000050] to-[#00017a] rounded-xl overflow-hidden shadow-xl h-[280px] sm:h-[320px]">
        {/* BACKGROUND PATTERN */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-5 h-full">
          {/* LEFT */}
          <div
            className="relative sm:col-span-2 h-[140px] sm:h-full overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/profile/${user.username}`)}
          >
            <img
              src={user.avatar?.url || defaultAvatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>

          {/* RIGHT */}
          <div className="sm:col-span-3 p-6 flex flex-col justify-center text-white relative">
            <div className="mb-4">
              <button
                onClick={() => navigate(`/profile/${user.username}`)}
                className="text-xl sm:text-2xl font-bold mb-1 hover:text-yellow-400 transition-colors text-left"
              >
                {user.firstName} {user.lastName}
              </button>
              <p className="text-gray-300 text-sm">@{user.username}</p>
            </div>

            {/* BIO */}
            {user.bio && (
              <p className="text-gray-200 text-sm leading-relaxed mb-4 line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* STATS INLINE */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-400 text-[#00017a] rounded-lg px-3 py-1">
                  <span className="font-bold text-lg">{projectCount}</span>
                </div>
                <span className="text-xs text-gray-300">
                  {projectCount === 1 ? "Project" : "Projects"}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/profile/${user.username}`)}
                className="btn btn-warning btn-sm text-[#00017a] font-semibold"
              >
                View Portfolio
              </button>
              <button
                onClick={() => navigate(`/projects`)}
                className="btn btn-outline btn-warning btn-sm hover:bg-yellow-400 hover:text-[#00017a]"
              >
                Projects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TIP */}
      <div className="mt-3 bg-yellow-400/10 border-l-4 border-yellow-400 rounded-lg p-3">
        <p className="text-xs text-gray-700">
          <span className="font-semibold text-[#00017a]">
            Want to be featured?
          </span>{" "}
          Keep creating and engaging! Artists are selected weekly based on
          contributions.
        </p>
      </div>
    </>
  );
};

export default FeaturedArtist;

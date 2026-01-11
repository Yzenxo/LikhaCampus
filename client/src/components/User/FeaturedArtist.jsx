import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FeaturedArtist = () => {
  const navigate = useNavigate();
  const [topWeekly, setTopWeekly] = useState([]);
  const [topMonthly, setTopMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("week");

  useEffect(() => {
    fetchTopArtists();
  }, []);

  const fetchTopArtists = async () => {
    try {
      setLoading(true);
      const [weeklyRes, monthlyRes] = await Promise.all([
        axios.get(`/featured-artist/top-weekly`, { withCredentials: true }),
        axios.get(`/featured-artist/top-monthly`, { withCredentials: true }),
      ]);

      setTopWeekly(weeklyRes.data.topArtists);
      setTopMonthly(monthlyRes.data.topArtists);
    } catch (err) {
      console.error("Failed to load top artists:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    const badges = ["🥇", "🥈", "🥉"];
    return badges[index] || "";
  };

  const getRankColor = (index) => {
    const colors = [
      "from-yellow-400 to-yellow-600",
      "from-gray-300 to-gray-400",
      "from-orange-400 to-orange-500",
    ];
    return colors[index] || "from-blue-400 to-blue-600";
  };

  if (loading) {
    return (
      <div className="card bg-gradient-to-br from-[#00017a] to-[#0002b3] shadow-lg p-6">
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-md text-white" />
        </div>
      </div>
    );
  }

  const currentTopArtists = activeTab === "week" ? topWeekly : topMonthly;

  if (!currentTopArtists || currentTopArtists.length === 0) {
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
          <h3 className="text-xl font-bold text-white">Top Artists</h3>
        </div>
        <p className="text-white/80 text-center py-4">
          No featured artists yet. Start creating!
        </p>
      </div>
    );
  }

  return (
    <div id="featured-artist" className="space-y-6">
      {/* HEADER WITH TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            Top Artists
          </div>
          <h2 className="text-2xl font-bold text-[#00017a]">
            Community Spotlight
          </h2>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("week")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "week"
                ? "bg-[#00017a] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "month"
                ? "bg-[#00017a] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* TOP 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentTopArtists.map((artist, index) => (
          <div
            key={artist.user._id}
            className={`relative bg-gradient-to-br ${getRankColor(index)} rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow cursor-pointer`}
            onClick={() => navigate(`/profile/${artist.user.username}`)}
          >
            {/* RANK BADGE */}
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-2xl">
                {getRankBadge(index)}
              </div>
            </div>

            {/* CARD CONTENT */}
            <div className="flex flex-col h-full">
              {/* AVATAR */}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={
                    artist.user.avatar?.url ||
                    "https://via.placeholder.com/400x400?text=No+Avatar"
                  }
                  alt={`${artist.user.firstName} ${artist.user.lastName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* INFO */}
              <div className="p-4 flex flex-col justify-between h-full text-white">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {artist.user.firstName} {artist.user.lastName}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    @{artist.user.username}
                  </p>
                  {artist.user.bio && (
                    <p className="text-white/90 text-sm mb-3 line-clamp-2">
                      {artist.user.bio}
                    </p>
                  )}

                  {/* STATS */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="font-bold text-lg">
                          {artist.totalUpvotes}
                        </span>
                      </div>
                      <span className="text-xs text-white/90">
                        {artist.totalUpvotes === 1 ? "Upvote" : "Upvotes"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="font-bold text-lg">
                          {artist.projectCount}
                        </span>
                      </div>
                      <span className="text-xs text-white/90">
                        {artist.projectCount === 1 ? "Project" : "Projects"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button className="btn btn-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 border-none text-white w-full mt-3">
                  View Portfolio
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM TIP */}
      <div className="bg-yellow-400/10 border-l-4 border-yellow-400 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-[#00017a]">
            Want to be featured?
          </span>{" "}
          Create amazing projects and get upvotes from the community! Rankings
          update based on {activeTab === "week" ? "weekly" : "monthly"}{" "}
          performance.
        </p>
      </div>
    </div>
  );
};

export default FeaturedArtist;

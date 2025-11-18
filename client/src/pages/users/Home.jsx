import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import students from "../../assets/Students-pana.png";
import hero from "../../assets/cover.png";
import logo from "../../assets/logo.png";
import FeaturedArtist from "../../components/User/FeaturedArtist.jsx";
import { useScrollToHash } from "../../hooks/useScrollToHash.js";

const Home = () => {
  useScrollToHash();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get("/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({ totalUsers: 0, totalProjects: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("/announcements");
      setAnnouncements(response.data.slice(0, 6));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const exploreProjects = () => {
    navigate("/projects");
  };

  return (
    <>
      <section className="relative w-screen h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 1, 122, 0.7) 0%, rgba(0, 0, 80, 0.7) 50%, rgba(0, 1, 122, 0.7) 100%)",
          }}
        ></div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg">
            LikhaCampus
          </h1>
          <p className="mb-8 text-lg sm:text-xl md:text-2xl text-gray-100 leading-relaxed">
            A hub for student creativity, collaboration, and inspiration
          </p>
          <button
            className="btn btn-warning text-royal-blue font-semibold px-8 py-4 text-lg transition-transform"
            onClick={exploreProjects}
          >
            Explore Projects
          </button>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row w-screen lg:h-[calc(100vh-4rem)]">
        <div className="w-full lg:w-1/2 bg-white flex justify-center items-center p-8 py-12 lg:p-6 order-1 lg:order-2">
          <img
            src={students}
            alt="Students collaborating illustration"
            className="w-full h-auto max-h-[450px] sm:max-h-[550px] lg:h-[90%] lg:max-h-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-start px-6 sm:px-12 lg:px-20 py-10 order-2 lg:order-1">
          <div className="mb-8">
            <img
              src={logo}
              alt="LikhaCampus Logo"
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>

          <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-[#00017a]">
            Showcase Your Creativity
          </h2>
          <p className="mb-8 max-w-md text-gray-600 leading-relaxed">
            Join a vibrant community of student artists and creators. Share your
            work, build your portfolio, and connect with fellow innovators in a
            collaborative environment designed for growth and inspiration.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-gradient-to-br from-[#00017a] to-[#000050] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
              <h3 className="text-sm text-gray-200 mb-2">Total Users</h3>
              <p className="text-3xl sm:text-4xl font-bold text-yellow-400">
                {statsLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  stats?.totalUsers || 0
                )}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#00017a] to-[#000050] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
              <h3 className="text-sm text-gray-200 mb-2">Published Projects</h3>
              <p className="text-3xl sm:text-4xl font-bold text-yellow-400">
                {statsLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  stats?.totalProjects || 0
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-[#00017a]">
            Why LikhaCampus?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="card-title text-xl text-[#00017a]">
                  Upload & Share
                </h3>
                <p className="text-gray-600">
                  Easily upload your projects and share them with the student
                  community
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="card-title text-xl text-[#00017a]">Network</h3>
                <p className="text-gray-600">
                  Connect with other student artists, designers, and creators
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="card-title text-xl text-[#00017a]">
                  Get Inspired
                </h3>
                <p className="text-gray-600">
                  Browse projects, discover new techniques, and fuel your
                  creativity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mt-8 px-4 max-w-5xl">
        <div className="space-y-16">
          <div className="px-2 sm:px-6 mb-12">
            <FeaturedArtist />
          </div>

          <div className="px-2 sm:px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#00017a]">
                Announcements
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-gray-400 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No announcements yet
                </p>
                <p className="text-gray-400 text-sm">
                  Check back soon for updates!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6">
                  {announcements.map((a, index) => (
                    <div
                      key={a._id}
                      id={`announcement-${a._id}`}
                      className={`card bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                        index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                      }`}
                      onClick={() => handleViewClick(a)}
                    >
                      <figure className="relative h-48 overflow-hidden">
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                          <p className="text-xs font-semibold text-[#00017a]">
                            {new Date(a.date || a.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </figure>

                      <div className="card-body p-5">
                        <h3 className="card-title text-base sm:text-lg text-[#00017a] line-clamp-2 mb-2 group-hover:text-yellow-600 transition-colors">
                          {a.title}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {a.content}
                        </p>

                        <div className="card-actions justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-semibold text-[#00017a] flex items-center gap-1">
                            Read More
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {announcements.length >= 6 && (
                  <div className="text-center mt-8">
                    <button
                      className="btn btn-outline btn-primary"
                      onClick={() => navigate("/announcements")}
                    >
                      View All Announcements
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-gray-100 text-gray-800 py-10 mt-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <div className="flex items-center mb-3">
                <img
                  src={logo}
                  alt="LikhaCampus Logo"
                  className="w-10 h-10 mr-2"
                />
                <h3 className="text-2xl font-bold text-[#00017a]">
                  LikhaCampus
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                A hub for student creativity, collaboration, and inspiration.
                Showcase your work and connect with fellow creators.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-[#00017a]">
                Quick Links
              </h4>
              <nav className="grid grid-cols-2 gap-2">
                <a
                  className="link link-hover text-gray-600 hover:text-[#00017a] transition text-sm cursor-pointer"
                  onClick={() => navigate("/home")}
                >
                  Home
                </a>
                <a
                  className="link link-hover text-gray-600 hover:text-[#00017a] transition text-sm cursor-pointer"
                  onClick={() => navigate("/projects")}
                >
                  Projects
                </a>
                <a
                  className="link link-hover text-gray-600 hover:text-[#00017a] transition text-sm cursor-pointer"
                  onClick={() => navigate("/about")}
                >
                  About Us
                </a>
                <a
                  className="link link-hover text-gray-600 hover:text-[#00017a] transition text-sm cursor-pointer"
                  onClick={() => navigate("/faq")}
                >
                  FAQ
                </a>
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              Copyright © {new Date().getFullYear()} LikhaCampus. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {showViewModal && selectedAnnouncement && (
        <dialog open className="modal" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-box max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-xl sm:text-2xl mb-4">
              {selectedAnnouncement.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Posted on{" "}
              {new Date(
                selectedAnnouncement.date || selectedAnnouncement.createdAt
              ).toLocaleDateString()}
            </p>
            <figure className="mb-4">
              <img
                src={selectedAnnouncement.imageUrl}
                alt={selectedAnnouncement.title}
                className="w-full h-auto object-contain"
              />
            </figure>
            <p className="text-sm sm:text-base whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </p>
            <div className="modal-action">
              <button
                className="btn btn-sm sm:btn-md"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAnnouncement(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default Home;

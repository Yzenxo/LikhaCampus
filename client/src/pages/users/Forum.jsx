import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ForumPost from "../../components/User/ForumPost";
import ForumSortDropdown from "../../components/User/ForumSortDropdown";
import { useAlert } from "../../hooks/useAlert";
import { useScrollToHash } from "../../hooks/useScrollToHash";

const Forum = () => {
  useScrollToHash();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalPosts: 0,
    hasMore: false,
  });

  useEffect(() => {
    axios
      .get("/user/me", {
        withCredentials: true,
      })
      .then((response) => {
        setCurrentUser(response.data.user);
      })
      .catch((err) => {
        console.error("Error fetching user: ", err);
        setCurrentUser(null);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (sortBy !== "newest") {
      params.set("sort", sortBy);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    const newUrl = params.toString() ? `/forum?${params.toString()}` : "/forum";
    navigate(newUrl, { replace: true });
  }, [sortBy, currentPage, navigate]);

  // Fetch posts when URL params change
  useEffect(() => {
    fetchPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sortBy, currentPage]);

  // Reset to page 1 when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/forum/posts`, {
        params: {
          sortBy: sortBy,
          page: currentPage,
          limit: 15,
        },
        withCredentials: true,
      });

      setPosts(response.data.posts || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setLoading(false);
    }
  };

  const Report = () => <span className="text-danger">Report</span>;

  const handleAddPost = async (e) => {
    e.preventDefault();

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    try {
      const response = await axios.post(
        "/forum/posts",
        {
          title: newPostTitle,
          content: newPostContent,
        },
        {
          withCredentials: true,
        }
      );

      const newPost = response.data;

      if (
        newPost.moderation?.status === "hidden" ||
        newPost.moderationWarning
      ) {
        setNewPostTitle("");
        setNewPostContent("");
        showAlert(
          newPost.moderationWarning ||
            "Your post is under review due to content policy",
          "warning"
        );
        return;
      }

      setPosts([newPost, ...posts]);

      setNewPostTitle("");
      setNewPostContent("");

      showAlert("Post created successfully!", "success");
    } catch (error) {
      console.error("Error creating post: ", error);
      showAlert(
        "Failed to create post: " +
          (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter((post) => post._id !== id));
    fetchPosts();
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(
      posts.map((post) =>
        post._id === updatedPost._id ? { ...post, ...updatedPost } : post
      )
    );
  };

  const handleReset = () => {
    setNewPostTitle("");
    setNewPostContent("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg">
          Loading posts...
        </span>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <div className="text-4xl font-bold">
        <span className="royal-blue">LIKHOW</span>{" "}
        <span className="yellow">FORUM</span>
      </div>
      <div className="container mx-auto mt-4 max-w-5xl">
        {/* POST FORM */}
        <div className="card mb-4 shadow-sm bg-base-100 p-4">
          <form
            onSubmit={handleAddPost}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex flex-col w-full gap-5">
              <input
                type="text"
                placeholder="Post title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                required
                className="input input-bordered h-[40px] w-full resize-none overflow-y-auto break-words"
              />
              <textarea
                type="text"
                placeholder="Share something with the forum..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                required
                className="textarea textarea-bordered h-auto w-full resize-none overflow-y-auto break-words"
              />
            </div>

            {/* BUTTONS*/}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
              >
                Post
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline btn-error w-full sm:w-auto"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* SORT DROPDOWN COMPONENT */}
        <ForumSortDropdown sortBy={sortBy} setSortBy={setSortBy} />

        {/* POSTS */}
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mt-4">
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
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No posts yet</p>
            <p className="text-gray-400 text-sm">
              Be the first to start a discussion!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id}>
              <ForumPost
                key={post._id}
                {...post}
                ReportComponent={Report}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
                currentUser={currentUser}
              />
            </div>
          ))
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-6">
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(pagination.totalPages)]
                .map((_, idx) => idx + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1) ||
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  );
                })
                .map((page) => {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span
                        key={page}
                        className="btn btn-sm btn-ghost btn-disabled"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`btn btn-sm ${
                        currentPage === page ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Forum;

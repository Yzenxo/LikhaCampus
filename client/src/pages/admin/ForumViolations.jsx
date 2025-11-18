import axios from "axios";
import { MessageSquareX } from "lucide-react";
import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/default_avatar.jpg";
import { useAlert } from "../../hooks/useAlert";

const ForumViolations = () => {
  const { showAlert } = useAlert();
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedComments, setFlaggedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [actionLoading, setActionLoading] = useState(null);
  const [deletePostModal, setDeletePostModal] = useState(null);
  const [deleteCommentModal, setDeleteCommentModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/forum/admin/flagged", {
        withCredentials: true,
      });

      setFlaggedPosts(response.data.posts || []);
      setFlaggedComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      showAlert("Failed to load flagged content", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const handleRestorePost = async (postId) => {
    try {
      setActionLoading(postId);
      await axios.post(
        `/forum/admin/posts/${postId}/restore`,
        {},
        {
          withCredentials: true,
        }
      );

      showAlert("Post restored successfully", "success");
      setFlaggedPosts(flaggedPosts.filter((p) => p._id !== postId));
    } catch (error) {
      console.error("Error restoring post:", error);
      showAlert(
        error.response?.data?.message || "Failed to restore post",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostModal) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/forum/admin/posts/${deletePostModal}/delete`, {
        data: {
          reason: "Violation of community guidelines",
        },
        withCredentials: true,
      });

      showAlert("Post deleted permanently", "success");
      setFlaggedPosts(flaggedPosts.filter((p) => p._id !== deletePostModal));
      setDeletePostModal(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      showAlert(
        error.response?.data?.message || "Failed to delete post",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreComment = async (commentId) => {
    try {
      setActionLoading(commentId);
      await axios.post(
        `/forum/admin/comments/${commentId}/restore`,
        {},
        {
          withCredentials: true,
        }
      );

      showAlert("Comment restored successfully", "success");
      setFlaggedComments(flaggedComments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error restoring comment:", error);
      showAlert(
        error.response?.data?.message || "Failed to restore comment",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentModal) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/forum/admin/comments/${deleteCommentModal}/delete`, {
        data: {
          reason: "Violation of community guidelines",
        },
        withCredentials: true,
      });

      showAlert("Comment deleted permanently", "success");
      setFlaggedComments(
        flaggedComments.filter((c) => c._id !== deleteCommentModal)
      );
      setDeleteCommentModal(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      showAlert(
        error.response?.data?.message || "Failed to delete comment",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPost = (post) => {
    const isLoading = actionLoading === post._id;

    return (
      <>
        <div key={post._id} className="card bg-base-100 shadow-md p-4 mb-4">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <img
                src={post.author?.avatar?.url || defaultAvatar}
                alt={post.author?.firstName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">
                  {post.author?.firstName} {post.author?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  @{post.author?.username}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="badge badge-error">
              {post.moderation.status === "hidden" ? "Auto-Hidden" : "Reported"}
            </div>
          </div>

          {/* CONTENT */}
          <h3 className="font-bold text-lg mb-2">{post.title}</h3>
          <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

          {/* MODERATION INFO */}
          <div className="card bg-base-200 p-3 rounded-lg mb-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Toxicity Score:</span>{" "}
                <span
                  className={
                    post.moderation.toxicityScore > 0.7
                      ? "text-error font-bold"
                      : "text-warning"
                  }
                >
                  {(post.moderation.toxicityScore * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="font-semibold">Reports:</span>{" "}
                {post.moderation.reports?.length || 0}
              </div>
              {post.moderation.autoFlagged && (
                <div className="col-span-2">
                  <span className="font-semibold">AI Reason:</span>{" "}
                  {post.moderation.flagReason}
                </div>
              )}
            </div>

            {/* USER REPORTS */}
            {post.moderation.reports && post.moderation.reports.length > 0 && (
              <div className="mt-3 pt-3 border-t border-base-300">
                <p className="font-semibold text-sm mb-2">User Reports:</p>
                {post.moderation.reports.map((report, idx) => (
                  <div
                    key={idx}
                    className="bg-base-100 p-3 rounded-lg mb-2 border border-base-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-sm badge-ghost">
                        {report.userId?.firstName} {report.userId?.lastName}
                      </span>
                    </div>

                    {report.details && (
                      <div>
                        <span className="font-semibold text-xs text-gray-600">
                          Details:
                        </span>
                        <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                          "{report.details}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button
              className="btn btn-outline btn-primary btn-sm flex-1"
              onClick={() => handleRestorePost(post._id)}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Restore"}
            </button>
            <button
              className="btn btn-outline btn-error btn-sm flex-1"
              onClick={() => setDeletePostModal(post._id)}
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderComment = (comment) => {
    const isLoading = actionLoading === comment._id;

    return (
      <>
        <div key={comment._id} className="card bg-base-100 shadow-md p-4 mb-4">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <img
                src={comment.author?.avatar?.url || defaultAvatar}
                alt={comment.author?.firstName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">
                  {comment.author?.firstName} {comment.author?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  @{comment.author?.username}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="badge badge-error">
              {comment.moderation.status === "hidden"
                ? "Auto-Hidden"
                : "Reported"}
            </div>
          </div>

          {/* CONTEXT - POST TITLE */}
          {comment.post && (
            <div className="bg-base-200 p-2 rounded mb-2 text-xs">
              <span className="font-semibold">On post:</span>{" "}
              {comment.post.title}
            </div>
          )}

          {/* CONTENT */}
          <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>

          {/* MODERATION INFO */}
          <div className="card bg-base-200 p-3 mb-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Toxicity Score:</span>{" "}
                <span
                  className={
                    comment.moderation.toxicityScore > 0.7
                      ? "text-error font-bold"
                      : "text-warning"
                  }
                >
                  {(comment.moderation.toxicityScore * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="font-semibold">Reports:</span>{" "}
                {comment.moderation.reports?.length || 0}
              </div>
              {comment.moderation.autoFlagged && (
                <div className="col-span-2">
                  <span className="font-semibold">AI Reason:</span>{" "}
                  {comment.moderation.flagReason}
                </div>
              )}
            </div>

            {/* USER REPORTS */}
            {comment.moderation.reports &&
              comment.moderation.reports.length > 0 && (
                <div className="mt-3 pt-3 border-t border-base-300">
                  <p className="font-semibold text-sm mb-2">User Reports:</p>
                  {comment.moderation.reports.map((report, idx) => (
                    <div
                      key={idx}
                      className="bg-base-100 p-3 rounded-lg mb-2 border border-base-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-sm badge-ghost">
                          {report.userId?.firstName} {report.userId?.lastName}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="font-semibold text-xs text-gray-600">
                          Reason:
                        </span>
                        <p className="text-sm text-gray-800">{report.reason}</p>
                      </div>

                      {report.details && (
                        <div>
                          <span className="font-semibold text-xs text-gray-600">
                            Details:
                          </span>
                          <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                            "{report.details}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button
              className="btn btn-outline btn-primary btn-sm flex-1"
              onClick={() => handleRestoreComment(comment._id)}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Restore"}
            </button>
            <button
              className="btn btn-outline btn-error btn-sm flex-1"
              onClick={() => setDeleteCommentModal(comment._id)}
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <MessageSquareX size={24} /> Forum Violations
          </h2>
          <p className="text-gray-600">
            Review and moderate flagged posts and comments
          </p>
        </div>

        {/* TABS */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === "posts" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts ({flaggedPosts.length})
          </button>
          <button
            className={`tab ${activeTab === "comments" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Comments ({flaggedComments.length})
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* POSTS TAB */}
            {activeTab === "posts" && (
              <div>
                {flaggedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No flagged posts to review</p>
                  </div>
                ) : (
                  flaggedPosts.map((post) => renderPost(post))
                )}
              </div>
            )}

            {/* COMMENTS TAB */}
            {activeTab === "comments" && (
              <div>
                {flaggedComments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No flagged comments to review
                    </p>
                  </div>
                ) : (
                  flaggedComments.map((comment) => renderComment(comment))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* DELETE POST MODAL */}
      {deletePostModal && (
        <div className="modal modal-open">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-error">Delete Post</h3>
            <p className="py-2">
              Are you sure you want to permanently delete this post?{" "}
              <span className="font-bold text-error">
                This action cannot be undone!
              </span>
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeletePostModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeletePost}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeletePostModal(null)}
          ></div>
        </div>
      )}

      {/* DELETE COMMENT MODAL */}
      {deleteCommentModal && (
        <div className="modal modal-open">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-error">Delete Comment</h3>
            <p className="py-2">
              Are you sure you want to permanently delete this comment?{" "}
              <span className="font-bold text-error">
                This action cannot be undone!
              </span>
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setDeleteCommentModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteComment}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeleteCommentModal(null)}
          ></div>
        </div>
      )}
    </>
  );
};

export default ForumViolations;

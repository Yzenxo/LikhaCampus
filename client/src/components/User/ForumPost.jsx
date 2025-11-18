import axios from "axios";
import { MessageCircle, UserStar } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";
import { useAlert } from "../../hooks/useAlert";
import EditPostModal from "../User/EditPostModal";
import EllipsisReport from "./EllipsisReport";

const ForumPost = ({
  _id,
  author,
  createdAt,
  updatedAt,
  title,
  content,
  upvotes,
  upvoteCount,
  commentCount,
  onDelete,
  onUpdate,
  currentUser,
}) => {
  const { showAlert } = useAlert();
  const [open, setOpen] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [voteCount, setVoteCount] = useState(upvoteCount || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(commentCount || 0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postData, setPostData] = useState({ _id, title, content });

  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  // React Hook Form for comment
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const {
    register: registerReply,
    handleSubmit: handleReplySubmit,
    reset: resetReply,
    formState: { errors: replyErrors, isSubmitting: isReplySubmitting },
  } = useForm({
    defaultValues: {
      reply: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
  } = useForm({
    defaultValues: {
      editContent: "",
    },
  });

  const safeAuthor = author || {
    _id: null,
    firstName: "Unknown",
    lastName: "User",
    username: "unknown",
    avatar: { url: null },
  };

  useEffect(() => {
    if (currentUser && upvotes) {
      setHasVoted(upvotes.includes(currentUser._id));
    }
  }, [currentUser, upvotes]);

  useEffect(() => {
    if (open && postComments.length === 0) {
      fetchComments();
    }
  }, [open]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await axios.get(`/forum/posts/${_id}/comments`, {
        withCredentials: true,
      });

      setPostComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments: ", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadMoreReplies = async (commentId, currentReplies) => {
    try {
      const response = await axios.get(
        `/forum/comments/${commentId}/replies?skip=${currentReplies.length}&limit=10`,
        {
          withCredentials: true,
        }
      );

      setPostComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, ...response.data.replies],
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error loading more replies: ", error);
      showAlert("Failed to load more replies.", "error");
    }
  };

  const handleVote = async () => {
    if (!currentUser) {
      showAlert("Please log in to upvote!", "warning");
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      const response = await axios.post(
        `/forum/posts/${_id}/upvote`,
        {},
        {
          withCredentials: true,
        }
      );

      setVoteCount(response.data.upvotes);
      setHasVoted(response.data.hasUpvoted);
    } catch (error) {
      console.error("Error toggling upvote: ", error);
      showAlert("Failed to upvote. Please try again.", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const onCommentSubmit = async (data) => {
    if (!currentUser) {
      showAlert("Please log in to comment!", "warning");
      return;
    }

    try {
      const response = await axios.post(
        `/forum/posts/${_id}/comments`,
        {
          content: data.comment.trim(),
        },
        {
          withCredentials: true,
        }
      );

      const newCommentData = response.data;

      if (
        newCommentData.moderation?.status === "hidden" ||
        newCommentData.moderationWarning
      ) {
        reset();
        showAlert(
          newCommentData.moderationWarning ||
            "Your comment is under review due to content policy",
          "warning"
        );
        return;
      }

      setPostComments([...postComments, newCommentData]);
      setLocalCommentCount(localCommentCount + 1);
      reset();
      showAlert("Comment posted!", "success");
    } catch (error) {
      console.error("Error posting comment: ", error);
      showAlert(
        "Failed to post comment: " +
          (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const onReplySubmit = async (data) => {
    if (!currentUser) {
      showAlert("Please log in to reply!", "warning");
      return;
    }

    const parentCommentId = replyingTo;

    if (!parentCommentId) {
      showAlert("Invalid reply target.", "error");
      return;
    }

    try {
      const response = await axios.post(
        `/forum/posts/${_id}/comments`,
        {
          content: data.reply.trim(),
          parentCommentId: parentCommentId,
        },
        {
          withCredentials: true,
        }
      );

      const newReply = response.data;

      setPostComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === parentCommentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
                replyCount: (comment.replyCount || 0) + 1,
              }
            : comment
        )
      );

      resetReply();
      setReplyingTo(null);
      showAlert("Reply posted!", "success");
    } catch (error) {
      console.error("Error posting reply: ", error);
      showAlert(
        "Failed to post reply: " +
          (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const onEditSubmit = async (data, commentId, isReply, parentId) => {
    try {
      const response = await axios.put(
        `/forum/comments/${commentId}`,
        {
          content: data.editContent.trim(),
        },
        {
          withCredentials: true,
        }
      );

      const updatedComment = response.data;

      if (isReply) {
        setPostComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === parentId
              ? {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply._id === commentId ? updatedComment.comment : reply
                  ),
                }
              : comment
          )
        );
      } else {
        setPostComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, ...updatedComment.comment }
              : comment
          )
        );
      }

      resetEdit();
      setEditingComment(null);
      showAlert("Comment updated!", "success");
    } catch (error) {
      console.error("Error editing comment: ", error);
      showAlert(
        "Failed to edit comment: " +
          (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const handleDeleteComment = (commentId) => {
    setPostComments(postComments.filter((c) => c._id !== commentId));
    setLocalCommentCount(localCommentCount - 1);
  };

  const handleDeleteReply = (parentCommentId, replyId) => {
    setPostComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === parentCommentId
          ? {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
              replyCount: (comment.replyCount || 0) - 1,
            }
          : comment
      )
    );
  };

  const handleStartEdit = (comment) => {
    setEditingComment(comment._id);
    setEditValue("editContent", comment.content);
  };

  const handlePostUpdate = (updatedPost) => {
    setPostData({
      _id: updatedPost._id,
      title: updatedPost.title,
      content: updatedPost.content,
    });
    showAlert("Post updated successfully!", "success");

    if (onUpdate) {
      onUpdate(updatedPost);
    }
  };

  const renderComment = (comment, isReply = false, parentId = null) => {
    const isEditing = editingComment === comment._id;
    const isOwner = currentUser?._id === comment.author?._id;

    return (
      <div
        key={comment._id}
        id={`comment-${comment._id}`}
        className={`mb-2 ${
          isReply
            ? "ml-8 border-l-2 border-base-300 pl-3"
            : "border-l-4 border-base-300 pl-3"
        }`}
      >
        <div className="text-xs text-muted flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src={comment.author?.avatar?.url || defaultAvatar}
              alt={comment.author?.firstName || "User"}
              className="w-6 h-6 rounded-full object-cover"
            />
            {comment.author?._id ? (
              <Link
                to={`/profile/${comment.author.username || comment.author._id}`}
                className="text-primary hover:underline"
              >
                <strong>
                  {comment.author.firstName} {comment.author.lastName}
                </strong>
              </Link>
            ) : (
              <strong>Unknown User</strong>
            )}
            <span>
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
              {comment.updatedAt &&
                new Date(comment.updatedAt).getTime() !==
                  new Date(comment.createdAt).getTime() && (
                  <span className="ml-1 italic">(Edited)</span>
                )}
            </span>
          </div>
          {currentUser && (
            <EllipsisReport
              type="Comment"
              targetId={comment._id}
              isOwner={isOwner}
              onDelete={() =>
                isReply
                  ? handleDeleteReply(parentId, comment._id)
                  : handleDeleteComment(comment._id)
              }
              onEdit={() => handleStartEdit(comment)}
              postId={_id}
            />
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              className={`textarea textarea-bordered w-full ${
                editErrors.editContent ? "textarea-error" : ""
              }`}
              {...registerEdit("editContent", {
                required: "Comment cannot be empty",
                minLength: {
                  value: 1,
                  message: "Comment must be at least 1 character",
                },
                maxLength: {
                  value: 1000,
                  message: "Comment cannot exceed 1000 characters",
                },
              })}
              disabled={isEditSubmitting}
            />
            {editErrors.editContent && (
              <p className="text-error text-sm">
                {editErrors.editContent.message}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleEditSubmit((data) =>
                  onEditSubmit(data, comment._id, isReply, parentId)
                )}
                disabled={isEditSubmitting}
              >
                {isEditSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setEditingComment(null);
                  resetEdit();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-0 text-sm mt-1 break-words whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Reply button (only for top-level comments) */}
            {!isReply && (
              <button
                className="btn btn-xs btn-ghost mt-1"
                onClick={() => setReplyingTo(comment._id)}
              >
                Reply
              </button>
            )}
          </>
        )}

        {/* Reply form */}
        {replyingTo === comment._id && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                className={`input input-bordered input-sm flex-1 ${
                  replyErrors.reply ? "input-error" : ""
                }`}
                {...registerReply("reply", {
                  required: "Reply cannot be empty",
                  minLength: {
                    value: 1,
                    message: "Reply must be at least 1 character",
                  },
                  maxLength: {
                    value: 1000,
                    message: "Reply cannot exceed 1000 characters",
                  },
                })}
                disabled={isReplySubmitting}
              />
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleReplySubmit(onReplySubmit)}
                disabled={isReplySubmitting}
              >
                {isReplySubmitting ? "..." : "Reply"}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setReplyingTo(null);
                  resetReply();
                }}
              >
                Cancel
              </button>
            </div>
            {replyErrors.reply && (
              <p className="text-error text-sm">{replyErrors.reply.message}</p>
            )}
          </div>
        )}

        {/* RENDER REPLIES */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) =>
              renderComment(reply, true, comment._id)
            )}

            {/* LOAD MORE REPLIES */}
            {comment.replyCount > comment.replies.length && (
              <button
                className="btn btn-xs btn-ghost mt-2"
                onClick={() => loadMoreReplies(comment._id, comment.replies)}
              >
                Load {comment.replyCount - comment.replies.length} more{" "}
                {comment.replyCount - comment.replies.length === 1
                  ? "reply"
                  : "replies"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        id={`post-${postData._id}`}
        className="card mb-3 shadow-sm bg-base-100 p-4"
      >
        {/* HEADER: AUTHOR + DATE + ELLIPSIS */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <img
              src={safeAuthor.avatar?.url || defaultAvatar}
              alt={safeAuthor.firstName || "Unknown user"}
              className="w-8 h-8 rounded-full object-cover"
            />

            <div className="text-sm text-muted">
              <strong>
                {safeAuthor.username ? (
                  <Link
                    to={`/profile/${safeAuthor.username}`}
                    className="text-primary hover:underline"
                  >
                    {safeAuthor.firstName} {safeAuthor.lastName}
                  </Link>
                ) : (
                  <span>
                    {safeAuthor.firstName} {safeAuthor.lastName}
                  </span>
                )}
              </strong>{" "}
              •{" "}
              {createdAt
                ? new Date(createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
              {updatedAt &&
                new Date(updatedAt).getTime() !==
                  new Date(createdAt).getTime() && (
                  <>
                    <span className="ml-1 italic">(Edited)</span>
                  </>
                )}
            </div>
          </div>

          {/* ELLIPSIS DROPDOWN */}
          {safeAuthor._id && (
            <EllipsisReport
              type="Post"
              targetId={_id}
              isOwner={currentUser?._id === safeAuthor._id}
              onDelete={onDelete}
              onEdit={() => setIsEditModalOpen(true)}
            />
          )}
        </div>

        {/* POST CONTENT */}
        <h2 className="font-bold text-lg break-words whitespace-pre-wrap">
          {postData.title}
        </h2>
        <p className="mb-3 break-words whitespace-pre-wrap">
          {postData.content}
        </p>

        {/* UPVOTE + COMMENT */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`btn btn-sm ${
              hasVoted ? "btn-primary" : "btn btn-outline-primary"
            }`}
          >
            <UserStar /> {isVoting ? "Loading..." : `Upvote (${voteCount})`}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="btn btn-sm btn-outline btn-secondary"
            aria-controls="comments-collapse"
            aria-expanded={open}
          >
            <MessageCircle strokeWidth={1.5} /> Comments ({localCommentCount})
          </button>
        </div>

        {/* COMMENT SECTION */}
        {open && (
          <div id="comments-collapse" className="mt-3">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm"></span>
              </div>
            ) : postComments.length === 0 ? (
              <p className="text-sm text-muted">No comments yet.</p>
            ) : (
              postComments.map((comment) => renderComment(comment))
            )}

            {/* WRITE COMMENT WITH RHF */}
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className={`input input-bordered flex-1 ${
                    errors.comment ? "input-error" : ""
                  }`}
                  {...register("comment", {
                    required: "Comment cannot be empty",
                    minLength: {
                      value: 1,
                      message: "Comment must be at least 1 character",
                    },
                    maxLength: {
                      value: 1000,
                      message: "Comment cannot exceed 1000 characters",
                    },
                  })}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit(onCommentSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "..." : "Post"}
                </button>
              </div>
              {errors.comment && (
                <p className="text-error text-sm">{errors.comment.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={postData}
        onUpdate={handlePostUpdate}
      />
    </>
  );
};

export default ForumPost;

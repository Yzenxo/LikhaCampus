import axios from "axios";
import { useForm } from "react-hook-form";

const EditPostModal = ({ isOpen, onClose, post, onUpdate }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: post.title,
      content: post.content,
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.patch(
        `/forum/posts/${post._id}`,
        {
          title: data.title.trim(),
          content: data.content.trim(),
        },
        {
          withCredentials: true,
        }
      );

      onUpdate(response.data.post);
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      alert(
        "Failed to update post: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog open className="modal">
        <div className="modal-box space-y-3">
          <h3 className="font-bold text-lg">Edit Post</h3>

          <div>
            <input
              type="text"
              placeholder="Title"
              className={`input input-bordered w-full ${
                errors.title ? "input-error" : ""
              }`}
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 1,
                  message: "Title must be at least 1 character",
                },
                maxLength: {
                  value: 200,
                  message: "Title cannot exceed 200 characters",
                },
              })}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-error text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Content"
              className={`textarea textarea-bordered w-full ${
                errors.content ? "textarea-error" : ""
              }`}
              rows="6"
              {...register("content", {
                required: "Content is required",
                minLength: {
                  value: 1,
                  message: "Content must be at least 1 character",
                },
                maxLength: {
                  value: 5000,
                  message: "Content cannot exceed 5000 characters",
                },
              })}
              disabled={isSubmitting}
            ></textarea>
            {errors.content && (
              <p className="text-error text-sm mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Update"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default EditPostModal;

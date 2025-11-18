import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ProjectUploader from "./ProjectUploader.jsx";
import SkillDropdown from "./SkillDropdown.jsx";

const EditProjectModal = ({ show, onHide, project, onUpdate }) => {
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);

  const [taggedUsers, setTaggedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      skill: "",
      category: "",
    },
  });

  const watchedSkill = watch("skill");
  const watchedCategory = watch("category");

  useEffect(() => {
    if (show && project) {
      reset({
        title: project.title || "",
        description: project.description || "",
        skill: project.skill || "",
        category: project.category || "",
      });
      setFiles([]);

      setTaggedUsers(project.taggedUsers || []);
    }
  }, [show, project, reset]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async (query) => {
    setIsSearching(true);
    try {
      const response = await axios.get(
        `/user/search?q=${encodeURIComponent(query)}`,
        {
          withCredentials: true,
        }
      );

      const filtered = response.data.users.filter(
        (user) => !taggedUsers.some((selected) => selected._id === user._id)
      );
      setSearchResults(filtered);
      setShowDropdown(filtered.length > 0);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = (user) => {
    setTaggedUsers([...taggedUsers, user]);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId) => {
    setTaggedUsers(taggedUsers.filter((user) => user._id !== userId));
  };

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  const handleSkillChange = (skill, category) => {
    setValue("skill", skill);
    setValue("category", category);
  };

  const onSubmit = async (data) => {
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("title", data.title.trim());
      uploadData.append("description", data.description.trim());
      uploadData.append("skill", data.skill);
      uploadData.append("category", data.category);

      if (taggedUsers.length > 0) {
        const taggedUserIds = taggedUsers.map((user) => user._id);
        uploadData.append("taggedUsers", JSON.stringify(taggedUserIds));
      } else {
        uploadData.append("taggedUsers", JSON.stringify([]));
      }

      if (files.length > 0) {
        files.forEach((fileObj) => {
          uploadData.append("files", fileObj.file);
        });
      }

      const response = await axios.patch(
        `/projects/${project._id}`,
        uploadData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onUpdate?.(response.data.project);

      reset();
      setFiles([]);
      setTaggedUsers([]);
      setError("");
      onHide();
    } catch (error) {
      console.error("Error updating project:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to update project. Please try again."
      );
    }
  };

  if (!show) return null;

  return (
    <>
      <dialog open className="modal">
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto space-y-3">
          <h3 className="font-bold text-lg">Edit Project</h3>

          <div className="space-y-4">
            {/* TITLE */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Project Title *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${
                  errors.title ? "input-error" : ""
                }`}
                placeholder="Enter project title"
                {...register("title", {
                  required: "Project title is required",
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
                <p className="text-error text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Project Description *</span>
              </label>
              <textarea
                rows={4}
                className={`textarea textarea-bordered w-full ${
                  errors.description ? "textarea-error" : ""
                }`}
                placeholder="Describe your project..."
                {...register("description", {
                  required: "Project description is required",
                  minLength: {
                    value: 1,
                    message: "Description must be at least 1 character",
                  },
                  maxLength: {
                    value: 5000,
                    message: "Description cannot exceed 5000 characters",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-error text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* SKILL + CATEGORY */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Skill & Category *</span>
              </label>
              <SkillDropdown
                selectedSkill={watchedSkill}
                selectedCategory={watchedCategory}
                onSelect={handleSkillChange}
              />
              <input
                type="hidden"
                {...register("skill", {
                  required: "Please select a skill",
                })}
              />
              <input
                type="hidden"
                {...register("category", {
                  required: "Please select a category",
                })}
              />
              {(errors.skill || errors.category) && (
                <p className="text-error text-sm mt-1">
                  {errors.skill?.message || errors.category?.message}
                </p>
              )}
            </div>

            {/* NEW: TAG USERS */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tag Users (Optional)</span>
              </label>

              <div className="space-y-2">
                {/* SELECTED USERS */}
                {taggedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {taggedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <img
                          src={user.avatar?.url || "/default-avatar.jpg"}
                          alt={user.firstName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>
                          {user.firstName} {user.lastName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user._id)}
                          className="hover:text-error transition-colors"
                          disabled={isSubmitting}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* SEARCH INPUT */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users to tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    className="input input-bordered w-full"
                    disabled={isSubmitting}
                  />

                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="loading loading-spinner loading-sm"></span>
                    </div>
                  )}

                  {/* DROPDOWN RESULTS */}
                  {showDropdown && searchResults.length > 0 && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => handleAddUser(user)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-base-200 transition-colors text-left"
                          >
                            <img
                              src={user.avatar?.url || "/default-avatar.jpg"}
                              alt={user.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-semibold">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* NO RESULTS */}
                  {searchQuery.length >= 2 &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm">
                        No users found
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* EXISTING MEDIA INFO */}
            {project &&
              (project.images?.length > 0 || project.videos?.length > 0) && (
                <div className="alert alert-info">
                  <span className="text-sm">
                    Current media: {project.images?.length || 0} image(s),{" "}
                    {project.videos?.length || 0} video(s). Upload new files to
                    replace existing media.
                  </span>
                </div>
              )}

            {/* FILE UPLOAD (OPTIONAL) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Update Project Media (Optional)
                </span>
              </label>
              <ProjectUploader
                onFilesChange={handleFilesChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep existing media
              </p>
            </div>
          </div>

          {error && (
            <div role="alert" className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              onClick={onHide}
              className="btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default EditProjectModal;

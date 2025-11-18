import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAlert } from "../../hooks/useAlert.js";
import ProjectUploader from "./ProjectUploader.jsx";
import SkillDropdown from "./SkillDropdown.jsx";

const UploadProjectModal = ({ show, onHide, onSave }) => {
  const { showAlert } = useAlert();
  const [isUploading, setIsUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      skill: "",
      category: "",
      files: [],
      taggedUsers: [],
    },
  });

  const taggedUsers = watch("taggedUsers");

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
    setValue("taggedUsers", [...taggedUsers, user]);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId) => {
    setValue(
      "taggedUsers",
      taggedUsers.filter((user) => user._id !== userId)
    );
  };

  const handleFilesChange = (newFiles) => {
    setValue("files", newFiles, { shouldValidate: true });
  };

  const handleSkillChange = (skill, category) => {
    setValue("skill", skill, { shouldValidate: true });
    setValue("category", category, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsUploading(true);

    try {
      const uploadData = new FormData();

      const tagsToUse = data.taggedUsers || watch("taggedUsers") || [];
      if (tagsToUse && tagsToUse.length > 0) {
        const taggedUserIds = tagsToUse.map((user) => user._id);
        uploadData.append("taggedUsers", JSON.stringify(taggedUserIds));
      }

      uploadData.append("title", data.title);
      uploadData.append("description", data.description);
      uploadData.append("skill", data.skill);
      uploadData.append("category", data.category);

      data.files.forEach((fileObj) => {
        uploadData.append("files", fileObj.file);
      });

      for (let pair of uploadData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await axios.post("/projects", uploadData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newProject = response.data;

      onSave?.(newProject);
      showAlert("Project uploaded successfully!", "success");
      reset();
      setSearchQuery("");
      setSearchResults([]);
      onHide();
    } catch (error) {
      console.error("Error uploading project:", error);
      showAlert(
        error.response?.data?.error || "Failed to upload project.",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal modal-open" tabIndex={-1}>
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">Upload Project</h3>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* TITLE */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Title *
              </label>
              <input
                id="title"
                type="text"
                className={`w-full px-3 py-2 rounded-md border ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                } focus:ring-2 focus:outline-none transition`}
                placeholder="Enter project title"
                {...register("title", {
                  required: "Project title is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Project title cannot be empty",
                })}
                disabled={isUploading}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Description *
                </label>
                <span className="text-xs text-gray-500">
                  {watch("description")?.length || 0}/10 min
                </span>
              </div>
              <textarea
                id="description"
                rows={4}
                className={`w-full px-3 py-2 rounded-md border ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                } focus:ring-2 focus:outline-none transition`}
                placeholder="Describe your project..."
                {...register("description", {
                  required: "Project description is required",
                  validate: (value) =>
                    value.trim().length >= 10 ||
                    "Description must be at least 10 characters",
                })}
                disabled={isUploading}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* SKILL + CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill & Category *
              </label>
              <Controller
                name="skill"
                control={control}
                rules={{
                  required: "Please select a skill and category",
                }}
                render={({ field }) => (
                  <div
                    className={`${
                      errors.skill ? "ring-2 ring-red-500 rounded-md" : ""
                    }`}
                  >
                    <SkillDropdown
                      selectedSkill={watch("skill")}
                      selectedCategory={watch("category")}
                      onSelect={handleSkillChange}
                    />
                  </div>
                )}
              />
              {errors.skill && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.skill.message}
                </p>
              )}
            </div>

            {/* TAG USERS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Users (Optional)
              </label>

              <div className="space-y-2">
                {/* Selected Users */}
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
                          disabled={isUploading}
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
                    placeholder="Search users to tag... (type at least 2 characters)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    className="input input-bordered w-full"
                    disabled={isUploading}
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

                  {/* No Results */}
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

            {/* FILE UPLOAD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Media *
              </label>
              <Controller
                name="files"
                control={control}
                rules={{
                  validate: (value) =>
                    value.length > 0 ||
                    "Please upload at least one image or video",
                }}
                render={({ field }) => (
                  <div
                    className={`${
                      errors.files ? "ring-2 ring-red-500 rounded-md" : ""
                    }`}
                  >
                    <ProjectUploader
                      onFilesChange={handleFilesChange}
                      disabled={isUploading}
                    />
                  </div>
                )}
              />
              {errors.files && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.files.message}
                </p>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setSearchQuery("");
                  setSearchResults([]);
                  onHide();
                }}
                className="btn"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </>
                ) : (
                  "Upload Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadProjectModal;

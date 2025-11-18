import axios from "axios";
import { AlertTriangle, CircleUserRound, Image, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";

const Settings = () => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [headerPreviewUrl, setHeaderPreviewUrl] = useState(null);
  const [headerFile, setHeaderFile] = useState(null);
  const [headerError, setHeaderError] = useState("");
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
    },
  });

  // Form for password change
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form for delete confirmation
  const {
    register: registerDelete,
    handleSubmit: handleSubmitDelete,
    formState: { errors: deleteErrors },
    reset: resetDelete,
  } = useForm({
    defaultValues: {
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/user/me", {
          withCredentials: true,
        });

        if (response.data.user) {
          const user = response.data.user;
          setCurrentUser(user);

          resetProfile({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            bio: user.bio || "",
          });

          if (user.avatar?.url) {
            setPreviewUrl(user.avatar.url);
          }

          if (user.headerImage?.url) {
            setHeaderPreviewUrl(user.headerImage.url);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        showAlert("Failed to load user data", "error");
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setAvatarError("File size must be less than 5MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setAvatarError("Only JPEG, PNG, and WebP images are allowed");
        return;
      }

      setAvatarFile(selectedFile);
      setAvatarError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleHeaderFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setHeaderError("File size must be less than 5MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setHeaderError("Only JPEG, PNG, and WebP images are allowed");
        return;
      }

      setHeaderFile(selectedFile);
      setHeaderError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleHeaderImageUpload = async () => {
    if (!headerFile) {
      showAlert("Please select a header image first", "warning");
      return;
    }

    setIsUploadingHeader(true);

    const formData = new FormData();
    formData.append("headerImage", headerFile);

    try {
      const response = await axios.put("/user/header-image", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert("Header image updated successfully!", "success");

      if (response.data.headerImage?.url) {
        setHeaderPreviewUrl(response.data.headerImage.url);
        setCurrentUser((prev) => ({
          ...prev,
          headerImage: response.data.headerImage,
        }));
      }

      setHeaderFile(null);
      setHeaderError("");

      // Clear file input
      const fileInput = document.getElementById("headerImageInput");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading header image:", error);
      showAlert(
        error.response?.data?.message || "Failed to upload header image",
        "error"
      );
    } finally {
      setIsUploadingHeader(false);
    }
  };

  const removeFile = () => {
    setAvatarFile(null);
    if (currentUser?.avatar?.url) {
      setPreviewUrl(currentUser.avatar.url);
    } else {
      setPreviewUrl(null);
    }
    setAvatarError("");

    const fileInput = document.getElementById("avatarInput");
    if (fileInput) fileInput.value = "";
  };

  const removeHeaderFile = () => {
    setHeaderFile(null);
    if (currentUser?.headerImage?.url) {
      setHeaderPreviewUrl(currentUser.headerImage.url);
    } else {
      setHeaderPreviewUrl(
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920"
      );
    }
    setHeaderError("");

    const fileInput = document.getElementById("headerImageInput");
    if (fileInput) fileInput.value = "";
  };

  const openFileDialog = () => {
    document.getElementById("avatarInput").click();
  };

  const openHeaderFileDialog = () => {
    document.getElementById("headerImageInput").click();
  };

  const onSubmitProfile = async (data) => {
    const formData = new FormData();

    if (data.firstName.trim()) {
      formData.append("firstName", data.firstName.trim());
    }
    if (data.lastName.trim()) {
      formData.append("lastName", data.lastName.trim());
    }
    if (data.bio.trim()) {
      formData.append("bio", data.bio.trim());
    }
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const response = await axios.patch("/user/settings", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        showAlert("Profile updated successfully!", "success");

        if (response.data.user) {
          setCurrentUser(response.data.user);
          if (response.data.user.avatar?.url) {
            setPreviewUrl(response.data.user.avatar.url);
          }
        }

        setAvatarFile(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.error || "Failed to update profile";

        switch (status) {
          case 400:
            showAlert(`Invalid input: ${message}`, "warning");
            break;
          case 422:
            showAlert(`Validation error: ${message}`, "warning");
            break;
          case 500:
            showAlert("Server error. Please try again later.", "error");
            break;
          default:
            showAlert(`Error: ${message}`, "error");
        }
      } else {
        showAlert("Network error. Please check your connection.", "error");
      }
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      const response = await axios.put(
        "/user/change-password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        { withCredentials: true }
      );

      showAlert("Password changed successfully!", "success");
      resetPassword();
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to change password. Please try again.";
      showAlert(errorMessage, "error");
    }
  };

  const handleCancelProfile = () => {
    if (currentUser) {
      resetProfile({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
      });

      if (currentUser.avatar?.url) {
        setPreviewUrl(currentUser.avatar.url);
      } else {
        setPreviewUrl(null);
      }
    }

    setAvatarFile(null);
    setAvatarError("");

    const fileInput = document.getElementById("avatarInput");
    if (fileInput) fileInput.value = "";
  };

  const handleDeactivateAccount = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post(
        "/user/account/deactivate",
        {},
        { withCredentials: true }
      );

      showAlert(
        response.data.message || "Account deactivated successfully",
        "success"
      );
      setIsDeactivateModalOpen(false);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Deactivation error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to deactivate account";
      showAlert(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async (data) => {
    setIsProcessing(true);
    try {
      const response = await axios.delete("/user/account/delete", {
        withCredentials: true,
        data: { password: data.confirmPassword },
      });

      showAlert(
        response.data.message || "Account deleted successfully",
        "success"
      );
      setIsDeleteModalOpen(false);
      resetDelete();

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Deletion error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete account";
      showAlert(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* EDIT PROFILE */}
      <div className="card bg-base-100 shadow-sm w-full max-w-2xl mx-auto mb-5">
        <div className="card-body">
          <h2 className="card-title">Edit profile</h2>
          <p>Update your display settings.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* FIRST NAME */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`input input-bordered w-full ${
                    profileErrors.firstName ? "input-error" : ""
                  }`}
                  placeholder="Enter first name"
                  {...registerProfile("firstName", {
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "First name cannot exceed 50 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z\s'-]+$/,
                      message:
                        "Only letters, spaces, hyphens, and apostrophes allowed",
                    },
                  })}
                  disabled={isProfileSubmitting}
                />
                {profileErrors.firstName && (
                  <p className="text-error text-sm mt-1">
                    {profileErrors.firstName.message}
                  </p>
                )}
              </div>

              {/* LAST NAME */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`input input-bordered w-full ${
                    profileErrors.lastName ? "input-error" : ""
                  }`}
                  placeholder="Enter last name"
                  {...registerProfile("lastName", {
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Last name cannot exceed 50 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z\s'-]+$/,
                      message:
                        "Only letters, spaces, hyphens, and apostrophes allowed",
                    },
                  })}
                  disabled={isProfileSubmitting}
                />
                {profileErrors.lastName && (
                  <p className="text-error text-sm mt-1">
                    {profileErrors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                rows={3}
                className={`textarea textarea-bordered w-full ${
                  profileErrors.bio ? "textarea-error" : ""
                }`}
                placeholder="Tell us about yourself..."
                {...registerProfile("bio", {
                  maxLength: {
                    value: 300,
                    message: "Bio cannot exceed 300 characters",
                  },
                })}
                disabled={isProfileSubmitting}
              />
              {profileErrors.bio && (
                <p className="text-error text-sm mt-1">
                  {profileErrors.bio.message}
                </p>
              )}
            </div>

            {/* AVATAR UPLOADER */}
            <div className="form-control flex flex-col items-center gap-2 my-4">
              <label className="label">
                <span className="label-text">Display Photo</span>
              </label>

              <div className="relative inline-flex">
                <button
                  type="button"
                  onClick={openFileDialog}
                  aria-label={previewUrl ? "Change image" : "Upload image"}
                  className="input input-bordered relative size-20 overflow-hidden p-0 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  disabled={isProfileSubmitting}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <CircleUserRound className="w-6 h-6 opacity-60" />
                  )}
                </button>

                {avatarFile && (
                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove image"
                    className="btn btn-circle btn-xs absolute -top-2 -right-2 border-2 shadow bg-base-100"
                    disabled={isProfileSubmitting}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <input
                  id="avatarInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProfileSubmitting}
                />
              </div>

              {avatarFile && (
                <p className="text-xs text-gray-500 mt-2">{avatarFile.name}</p>
              )}

              {avatarError && (
                <p className="text-error text-sm mt-1">{avatarError}</p>
              )}

              <p className="text-xs text-gray-500 text-center">
                Max size: 5MB • Formats: JPG, PNG, WebP
              </p>
            </div>

            {/* BUTTONS */}
            <div className="justify-end card-actions">
              <button
                type="button"
                className="btn"
                onClick={handleCancelProfile}
                disabled={isProfileSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitProfile(onSubmitProfile)}
                className="btn btn-primary"
                disabled={isProfileSubmitting}
              >
                {isProfileSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER IMAGE UPLOADER */}
      <div className="card bg-base-100 shadow-sm w-full max-w-2xl mx-auto mb-5">
        <div className="card-body">
          <h2 className="card-title">Cover Photo</h2>
          <p>Update your profile cover photo.</p>

          <div className="space-y-4">
            {/* HEADER IMAGE PREVIEW */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Current Cover Photo</span>
              </label>

              <div className="relative w-full h-48 bg-base-200 rounded-lg overflow-hidden">
                <img
                  src={
                    headerPreviewUrl ||
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920"
                  }
                  alt="Header preview"
                  className="w-full h-full object-cover"
                />

                {headerFile && (
                  <button
                    type="button"
                    onClick={removeHeaderFile}
                    aria-label="Remove header image"
                    className="btn btn-circle btn-sm absolute top-2 right-2 shadow bg-base-100"
                    disabled={isUploadingHeader}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {headerFile && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {headerFile.name}
                </p>
              )}

              {headerError && (
                <p className="text-error text-sm mt-1">{headerError}</p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Recommended size: 1500x500 pixels • Max size: 5MB • Formats:
                JPG, PNG, WebP
              </p>
            </div>

            {/* UPLOAD BUTTONS */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openHeaderFileDialog}
                className="btn btn-outline gap-2"
                disabled={isUploadingHeader}
              >
                <Image size={18} />
                Choose Image
              </button>

              {headerFile && (
                <button
                  type="button"
                  onClick={handleHeaderImageUpload}
                  className="btn btn-primary gap-2"
                  disabled={isUploadingHeader}
                >
                  {isUploadingHeader ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image size={18} />
                      Save Cover Photo
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              id="headerImageInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleHeaderFileChange}
              className="hidden"
              disabled={isUploadingHeader}
            />
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="card bg-base-100 shadow-sm w-full max-w-2xl mx-auto mb-5">
        <div className="card-body">
          <h2 className="card-title">Change Password</h2>
          <p className="mb-4">Change your account's password.</p>

          <form
            className="space-y-5"
            onSubmit={handleSubmitPassword(onSubmitPassword)}
          >
            {/* CURRENT PASSWORD */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password *
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className={`w-full px-3 py-2 rounded-md border ${
                  passwordErrors.currentPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                } focus:ring-2 focus:outline-none transition`}
                placeholder="••••••••"
                {...registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
                disabled={isPasswordSubmitting}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password *
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 py-2 rounded-md border ${
                  passwordErrors.newPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                } focus:ring-2 focus:outline-none transition`}
                placeholder="••••••••"
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                disabled={isPasswordSubmitting}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 py-2 rounded-md border ${
                  passwordErrors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                } focus:ring-2 focus:outline-none transition`}
                placeholder="••••••••"
                {...registerPassword("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
                disabled={isPasswordSubmitting}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="card-actions justify-end">
              <button
                type="button"
                onClick={() => resetPassword()}
                className="btn"
                disabled={isPasswordSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPasswordSubmitting}
              >
                {isPasswordSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PROFILE CONFIGURATION (DEACTIVATE/DELETE) */}
      <div className="card bg-base-100 shadow-sm w-full max-w-2xl mx-auto mb-5">
        <div className="card-body">
          <h2 className="card-title">Profile Configuration</h2>
          <p className="mb-4">Deactivate or delete your account.</p>

          <div className="space-y-4">
            {/* DEACTIVATE ACCOUNT */}
            <div className="p-4 border border-warning rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Deactivate Account</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Temporarily disable your account. You can reactivate within
                    15 days by logging in again.
                  </p>
                  <button
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="btn btn-warning btn-sm mt-3"
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>

            {/* DELETE ACCOUNT */}
            <div className="p-4 border border-error rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Delete Account</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="btn btn-error btn-sm mt-3"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEACTIVATE CONFIRMATION MODAL */}
      {isDeactivateModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Deactivate Account?
            </h3>
            <p className="py-4">
              Are you sure you want to deactivate your account?
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 mb-4">
              <li>Your profile will be hidden from other users</li>
              <li>
                You can reactivate within <strong>15 days</strong> by logging in
              </li>
              <li>
                After 15 days, your account will be{" "}
                <strong>permanently deleted</strong>
              </li>
              <li>All your projects, posts, and comments will be removed</li>
            </ul>
            <div className="modal-action">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="btn"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                className="btn btn-warning"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deactivating...
                  </>
                ) : (
                  "Yes, Deactivate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-error" />
              Delete Account Permanently?
            </h3>
            <p className="py-4 text-error font-semibold">
              ⚠️ This action is irreversible!
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 mb-4">
              <li>
                Your account will be <strong>permanently deleted</strong>
              </li>
              <li>All your projects and media will be removed</li>
              <li>All your forum posts and comments will be deleted</li>
              <li>You cannot recover your account after deletion</li>
            </ul>

            <form onSubmit={handleSubmitDelete(handleDeleteAccount)}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Enter your password to confirm *
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`input input-bordered ${
                    deleteErrors.confirmPassword ? "input-error" : ""
                  }`}
                  {...registerDelete("confirmPassword", {
                    required: "Password is required to delete account",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  disabled={isProcessing}
                />
                {deleteErrors.confirmPassword && (
                  <p className="text-error text-sm mt-1">
                    {deleteErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    resetDelete();
                  }}
                  className="btn"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-error"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;

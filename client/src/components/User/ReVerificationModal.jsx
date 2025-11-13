import axios from "axios";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ReVerificationModal = ({ isOpen, reason, onSuccess }) => {
  const { showAlert } = useAlert();
  const [registrationForm, setRegistrationForm] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showAlert("Only PDF files are allowed", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert("File size must be less than 10MB", "error");
        return;
      }
      setRegistrationForm(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!registrationForm) {
      showAlert("Please upload your registration form", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("registrationForm", registrationForm);

    setUploading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/reverify`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      showAlert(response.data.message, "success");
      onSuccess();
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Re-verification failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog open className="modal modal-open">
        <div className="modal-box max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-warning" />
            <h3 className="font-bold text-lg">Re-Verification Required</h3>
          </div>

          <div className="alert alert-warning mb-4">
            <div>
              <p className="font-semibold">New semester settings detected!</p>
              <p className="text-sm">{reason}</p>
            </div>
          </div>

          <p className="mb-4">
            Please upload your current semester registration form to continue
            using LikhaCampus.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Registration Form (PDF) *
                </span>
              </label>
              <div className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
                <FileText className="w-8 h-8 text-gray-400" />
                <div className="flex-1">
                  {fileName ? (
                    <p className="text-sm font-medium truncate">{fileName}</p>
                  ) : (
                    <p className="text-sm text-gray-500">No file selected</p>
                  )}
                </div>
                <label className="btn btn-sm btn-primary cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Browse
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!registrationForm || uploading}
            >
              {uploading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading...
                </>
              ) : (
                "Submit & Continue"
              )}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default ReVerificationModal;

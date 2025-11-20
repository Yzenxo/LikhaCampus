import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

const ExcelUploadPanel = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [studentCount, setStudentCount] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file first" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await axios.post(
        "/student-database/upload-students",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setMessage({
        type: "success",
        text: response.data.message,
        details: {
          totalProcessed: response.data.totalProcessed,
          totalInserted: response.data.totalInserted,
          duplicatesSkipped: response.data.duplicatesSkipped,
        },
      });

      fetchStudentCount();

      setFile(null);
      document.getElementById("excelFile").value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to upload file",
      });
    } finally {
      setUploading(false);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const response = await axios.get("/auth/students-count", {
        withCredentials: true,
      });
      setStudentCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch student count:", error);
    }
  };

  useEffect(() => {
    fetchStudentCount();
  }, []);

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <Upload size={24} /> Student Database Management
          </h2>
          <p className="text-gray-600">
            Upload an Excel file containing student information to validate
            registrations
          </p>
        </div>

        <div className="card bg-white shadow-md p-8">
          {/* INSTRUCTIONS */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Excel Format Requirements:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Column 1: <strong>firstName</strong> (e.g., Juan)
              </li>
              <li>
                • Column 2: <strong>lastName</strong> (e.g., Dela Cruz)
              </li>
              <li>
                • Column 3: <strong>studentNumber</strong> (e.g., 123456789)
              </li>
              <li>
                • Column 4: <strong>yearLevel</strong> (e.g., 1st Year, 2nd
                Year, etc.)
              </li>
            </ul>
            <p className="text-xs text-blue-700 mt-2">
              Column names must match exactly (case-sensitive)
            </p>
          </div>

          {/* CURRENT STUDENT COUNT */}
          {studentCount !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                <strong>Current Students in Database:</strong> {studentCount}
              </p>
            </div>
          )}

          {/* FILE UPLOAD SECTION */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <FileSpreadsheet className="mx-auto mb-4 text-gray-400" size={48} />
            <label
              htmlFor="excelFile"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <Upload size={20} />
              Choose Excel File
            </label>
            <input
              id="excelFile"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
              <p className="mt-4 text-sm text-gray-700">
                Selected: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          {/* UPLOAD BUTTON */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Students
              </>
            )}
          </button>

          {/* PROCESS MESSAGES */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.type === "success" ? (
                  <CheckCircle
                    className="text-green-600 flex-shrink-0"
                    size={24}
                  />
                ) : (
                  <AlertCircle
                    className="text-red-600 flex-shrink-0"
                    size={24}
                  />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      message.type === "success"
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    {message.text}
                  </p>
                  {message.details && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Total Processed: {message.details.totalProcessed}</p>
                      <p>
                        Successfully Inserted: {message.details.totalInserted}
                      </p>
                      {message.details.duplicatesSkipped > 0 && (
                        <p className="text-yellow-700">
                          Duplicates Skipped:{" "}
                          {message.details.duplicatesSkipped}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTIONS */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Prepare your Excel file with the required columns</li>
              <li>Upload the file using the button above</li>
              <li>The system will validate and import all student records</li>
              <li>
                Students can now register only if their information matches the
                database
              </li>
              <li>Uploading a new file will replace the existing database</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExcelUploadPanel;

import axios from "axios";
import { AlertCircle, Calendar, Save, University } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const SemesterSettings = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    currentAcademicYear: "",
    currentSemester: "",
    lastUpdatedBy: null,
    updatedAt: null,
  });

  const [formData, setFormData] = useState({
    currentAcademicYear: "",
    currentSemester: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/admin/settings/semester", {
        withCredentials: true,
      });
      setSettings(response.data.settings);
      setFormData({
        currentAcademicYear: response.data.settings.currentAcademicYear,
        currentSemester: response.data.settings.currentSemester,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      showAlert("Failed to load settings", "error");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(formData.currentAcademicYear)) {
      showAlert(
        "Academic year must be in format YYYY-YYYY (e.g., 2024-2025)",
        "error"
      );
      return;
    }

    const [startYear, endYear] = formData.currentAcademicYear
      .split("-")
      .map(Number);
    if (endYear - startYear !== 1) {
      showAlert("Academic year must be consecutive (e.g., 2024-2025)", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put("/admin/settings/semester", formData, {
        withCredentials: true,
      });

      setSettings(response.data.settings);
      showAlert("Semester settings updated successfully!", "success");
    } catch (error) {
      console.error("Error updating settings:", error);
      showAlert(
        error.response?.data?.message || "Failed to update settings",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-3 space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <University size={24} /> Semester Settings
          </h2>
          <p className="text-gray-600">
            Configure the current academic year and semester for registration
            validation
          </p>
        </div>

        {/* CURRENT SETTINGS DISPLAY */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">
              <Calendar className="w-5 h-5" />
              Current Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="stat bg-primary/5 rounded-lg">
                <div className="stat-title">Academic Year</div>
                <div className="stat-value text-2xl text-primary">
                  {settings.currentAcademicYear}
                </div>
              </div>

              <div className="stat bg-secondary/5 rounded-lg">
                <div className="stat-title">Current Semester</div>
                <div className="stat-value text-2xl text-secondary">
                  {settings.currentSemester}
                </div>
              </div>
            </div>

            {settings.updatedAt && (
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date(settings.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* UPDATE SETTINGS FORM */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Update Settings</h2>

            <div className="alert alert-warning mb-6">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Important:</p>
                <p className="text-sm">
                  Changing these settings will immediately affect which
                  registration forms are accepted. Only registration forms
                  matching the new settings will be valid.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ACADEMIC YEAR */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Academic Year
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="2024-2025"
                  className="input input-bordered w-full"
                  value={formData.currentAcademicYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentAcademicYear: e.target.value,
                    })
                  }
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Format: YYYY-YYYY (e.g., 2024-2025)
                  </span>
                </label>
              </div>

              {/* CURRENT SEMESTER */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Current Semester
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.currentSemester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentSemester: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="card bg-info/10 shadow-md mt-6">
          <div className="card-body">
            <h3 className="font-semibold text-lg mb-2">How This Works:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                Registration forms are validated against these settings during
                student registration
              </li>
              <li>
                Students must upload registration forms matching the current
                academic year and semester
              </li>
              <li>Update these settings at the start of each new semester</li>
              <li>
                No grace period - settings take effect immediately after saving
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SemesterSettings;

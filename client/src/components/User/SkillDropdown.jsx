import axios from "axios";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const SkillDropdown = ({ onSelect }) => {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [approvedCategories, setApprovedCategories] = useState({});
  const { showAlert } = useAlert();

  const skillCategories = {
    "Handicrafts & Applied Arts": [
      "Basic tailoring",
      "Embroidery & textile work",
      "Craft-based product creation",
    ],
    "Visual Arts": [
      "Freehand drawing",
      "Technical drawing",
      "Poster & banner design",
    ],
    "Software & Computing Skills": [
      "App development",
      "Mobile development",
      "Game development",
    ],
    "Digital & Multimedia Arts": [
      "Graphic design",
      "Photo editing",
      "Video editing",
    ],
    "Craft & Maker Skills": [
      "Metal fabrication",
      "Woodworking",
      "Product prototyping",
    ],
    "Performing & Creative Expressions": [
      "Stage Performance",
      "Music performance",
      "Creative writing",
    ],
    Passion: [
      "Personal Growth",
      "Hobbies",
      "Competitions",
      "Achievements",
      "Learning Journey",
    ],
  };

  useEffect(() => {
    fetchApprovedCategories();
  }, []);

  const fetchApprovedCategories = async () => {
    try {
      const response = await axios.get("/category-request/approved");
      setApprovedCategories(response.data || {});
    } catch (error) {
      console.error("Error fetching approved categories:", error);
    }
  };

  const getCategoriesForSkill = (skill) => {
    const baseCategories = skillCategories[skill] || [];
    const customCats = approvedCategories[skill] || [];
    return [...baseCategories, ...customCats];
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    const categories = getCategoriesForSkill(skill);
    setSelectedCategory(categories[0] || "");
    onSelect?.(skill, categories[0] || "");
  };

  const handleCategorySelect = (category) => {
    if (category === "others") {
      setShowModal(true);
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
      onSelect?.(selectedSkill, category);
    }
  };

  const handleRequestSubmit = async () => {
    if (!customCategory.trim()) return;

    try {
      await axios.post("/category-request", {
        categoryName: customCategory.trim(),
        skillName: selectedSkill,
      });

      setRequestSubmitted(true);
      setCustomCategory("");

      setTimeout(() => {
        setRequestSubmitted(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting category request:", error);
      showAlert("Failed to submit request", "error");
      setCustomCategory("");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCustomCategory("");
    setRequestSubmitted(false);
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col md:flex-row gap-3 mb-3 p-3">
        {/* MAIN SKILL */}
        <select
          className="select select-primary w-full md:w-auto whitespace-nowrap"
          value={selectedSkill}
          onChange={(e) => handleSkillSelect(e.target.value)}
        >
          <option value="" disabled>
            Select a skill
          </option>
          {Object.keys(skillCategories).map((skill) => (
            <option key={skill} value={skill} className="whitespace-nowrap">
              {skill}
            </option>
          ))}
        </select>

        {/* SUB CATEGORY */}
        {selectedSkill && (
          <select
            className="select select-secondary w-full md:w-auto whitespace-nowrap"
            value={selectedCategory}
            onChange={(e) => handleCategorySelect(e.target.value)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {getCategoriesForSkill(selectedSkill).map((category) => (
              <option
                key={category}
                value={category}
                className="whitespace-nowrap"
              >
                {category}
              </option>
            ))}
            <option value="others" className="whitespace-nowrap font-semibold">
              Others (Request New Category)
            </option>
          </select>
        )}
      </div>

      {/* CUSTOM CATEGORY MODAL */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Request New Category</h3>

            <div className="mb-4">
              <p className="text-sm text-base-content/70 mb-2">
                Skill: <span className="font-semibold">{selectedSkill}</span>
              </p>
              <label className="label">
                <span className="label-text">Category Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter new category name..."
                className="input input-bordered w-full"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !requestSubmitted) {
                    handleRequestSubmit();
                  }
                }}
                autoFocus
              />
            </div>

            {requestSubmitted ? (
              showAlert(
                "Request submitted! Awaiting admin approval.",
                "success"
              )
            ) : (
              <div className="modal-action">
                <button className="btn btn-ghost" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleRequestSubmit}
                  disabled={!customCategory.trim()}
                >
                  Submit Request
                </button>
              </div>
            )}
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  );
};

export default SkillDropdown;

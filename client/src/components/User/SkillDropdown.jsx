import { useState } from "react";

const SkillDropdown = ({ onSelect }) => {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const skillCategories = {
    "Critical Thinking": ["Problem Solving", "Research", "Analysis"],
    Communication: ["Writing", "Public Speaking", "Digital Communication"],
    Collaboration: ["Group Projects", "Teamwork", "Peer Learning"],
    Creativity: ["Arts", "Design", "Innovation", "Storytelling"],
    "Information Literacy": ["Research Papers", "Reports", "Data Handling"],
    "Media Literacy": ["Journalism", "Multimedia", "Social Media Awareness"],
    "Technology Literacy": ["Coding", "App Development", "Digital Tools"],
    Flexibility: ["Adaptability", "Multitasking", "Sports"],
    Leadership: ["Student Government", "Project Management", "Mentorship"],
    Initiative: ["Volunteering", "Entrepreneurship", "Independent Projects"],
    Productivity: ["Time Management", "Goal Setting", "Efficiency Tools"],
    "Social Skills": ["Networking", "Empathy", "Conflict Resolution"],
    Passion: [
      "Personal Growth",
      "Hobbies",
      "Competitions",
      "Achievements",
      "Learning Journey",
    ],
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setSelectedCategory(skillCategories[skill][0]);
    onSelect?.(skill, skillCategories[skill][0]);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelect?.(selectedSkill, category);
  };

  return (
    <>
      <div className="w-full flex flex-col md:flex-row gap-3 mb-3 p-3">
        {/* MAIN SKILL */}
        <select
          className="select select-primary w-full md:w-auto whitespace-nowrap"
          value={selectedSkill}
          onChange={(e) => {
            handleSkillSelect(e.target.value);
          }}
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
            {skillCategories[selectedSkill].map((category) => (
              <option
                key={category}
                value={category}
                className="whitespace-nowrap"
              >
                {category}
              </option>
            ))}
          </select>
        )}
      </div>
    </>
  );
};

export default SkillDropdown;

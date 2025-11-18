import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAlert } from "../../hooks/useAlert.js";

const SkillsAssessment = () => {
  const { showAlert } = useAlert();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    {
      name: "Learning Skills",
      key: "learningSkills",
      questions: [
        "I can effectively set learning goals for myself",
        "I adapt my learning strategies based on the subject matter",
        "I can identify my strengths and weaknesses in learning",
        "I actively seek feedback to improve my understanding",
        "I can manage my time effectively when studying",
        "I use critical thinking to analyze information",
        "I can work collaboratively with others to learn",
        "I reflect on what I learn to deepen my understanding",
        "I persist through challenging learning tasks",
        "I take initiative in my own learning process",
      ],
    },
    {
      name: "Literacy Skills",
      key: "literacySkills",
      questions: [
        "I can read and comprehend complex texts",
        "I express my ideas clearly in writing",
        "I can analyze and interpret written information",
        "I use proper grammar and punctuation in my writing",
        "I can summarize key points from what I read",
        "I evaluate the credibility of written sources",
        "I can write for different audiences and purposes",
        "I understand and use subject-specific vocabulary",
        "I can organize my thoughts coherently in writing",
        "I read regularly to expand my knowledge",
      ],
    },
    {
      name: "Life Skills",
      key: "lifeSkills",
      questions: [
        "I manage stress effectively in daily situations",
        "I make responsible decisions considering consequences",
        "I communicate effectively with diverse people",
        "I resolve conflicts in a constructive manner",
        "I demonstrate empathy and understanding toward others",
        "I manage my finances responsibly",
        "I take responsibility for my actions",
        "I adapt well to changes and new situations",
        "I set and work toward personal goals",
        "I maintain a healthy work-life balance",
      ],
    },
    {
      name: "Technology Skills",
      key: "technologySkills",
      questions: [
        "I am proficient in using common software applications",
        "I can troubleshoot basic technology problems",
        "I use digital tools to enhance my productivity",
        "I practice safe and responsible online behavior",
        "I can evaluate digital information for accuracy",
        "I collaborate effectively using digital platforms",
        "I protect my privacy and security online",
        "I can learn new technology tools independently",
        "I use technology to communicate effectively",
        "I stay updated with relevant technological changes",
      ],
    },
  ];

  useEffect(() => {
    loadExistingAssessment();
  }, []);

  const loadExistingAssessment = async () => {
    try {
      const response = await axios.get("/assessment", {
        withCredentials: true,
      });

      const responseObj = {};
      if (response.data.assessment.responses) {
        for (const [key, value] of Object.entries(
          response.data.assessment.responses
        )) {
          responseObj[key] = value;
        }
      }
      setResponses(responseObj);
      setShowResults(true);
    } catch (error) {
      console.log("No existing assessment found.");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (categoryIndex, questionIndex, value) => {
    setResponses({
      ...responses,
      [`${categoryIndex}-${questionIndex}`]: value,
    });
  };

  const validateCurrentCategory = () => {
    for (let i = 0; i < 10; i++) {
      if (!responses[`${currentCategory}-${i}`]) {
        return false;
      }
    }
    return true;
  };

  const calculateCategoryScore = (categoryIndex) => {
    let total = 0;
    let count = 0;
    for (let i = 0; i < 10; i++) {
      const response = responses[`${categoryIndex}-${i}`];
      if (response) {
        total += response;
        count++;
      }
    }
    return count > 0 ? (total / count).toFixed(2) : 0;
  };

  const allQuestionsAnswered = () => {
    return Object.keys(responses).length === 40;
  };

  const handleNext = () => {
    if (!validateCurrentCategory()) {
      const unanswered = [];
      for (let i = 0; i < 10; i++) {
        if (!responses[`${currentCategory}-${i}`]) {
          unanswered.push(i + 1);
        }
      }
      showAlert(
        `Please answer all questions in this category before proceeding. Missing: Question ${unanswered.join(", ")}`,
        "warning"
      );
      return;
    }

    if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered()) return;
    setSaving(true);

    try {
      const scores = {};
      categories.forEach((cat, idx) => {
        scores[cat.key] = parseFloat(calculateCategoryScore(idx));
      });

      const overallScore = parseFloat(
        (
          Object.values(scores).reduce((sum, score) => sum + score, 0) / 4
        ).toFixed(2)
      );

      await axios.post(
        "/assessment",
        {
          responses,
          scores,
          overallScore,
        },
        {
          withCredentials: true,
        }
      );

      setShowResults(true);
      showAlert("Assessment saved successfully!", "success");
    } catch (error) {
      console.error("Error saving assessment: ", error);
      showAlert(
        error.response?.data?.message ||
          "Failed to save assessment. Please try again.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const resetAssessment = () => {
    setResponses({});
    setCurrentCategory(0);
    setShowResults(false);
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </>
    );
  }

  if (showResults) {
    const chartData = categories.map((cat, idx) => ({
      category: cat.name,
      score: parseFloat(calculateCategoryScore(idx)),
      percentage: ((parseFloat(calculateCategoryScore(idx)) / 5) * 100).toFixed(
        1
      ),
    }));

    const radarData = categories.map((cat, idx) => ({
      subject: cat.name.split(" ")[0],
      score: parseFloat(calculateCategoryScore(idx)),
    }));

    const overallAverage = (
      chartData.reduce((sum, item) => sum + item.score, 0) / 4
    ).toFixed(2);

    return (
      <>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 min-h-screen">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h1 className="card-title text-4xl font-bold justify-center mb-2">
                Skills Assessment Results
              </h1>
              <p className="text-center text-base-content/70 mb-6">
                Your comprehensive skills profile
              </p>

              <div className="card bg-royal-blue text-white mb-6 p-3">
                <div className="flex flex-col items-center justify-center w-full">
                  <h2 className="text-xl font-semibold mb-2">Overall Score</h2>
                  <p className="text-4xl md:text-5xl font-bold">
                    {overallAverage} / 5.0
                  </p>
                  <p className="text-sm mt-2">
                    ({((overallAverage / 5) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Category Scores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="hsl(var(--p))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Skills Radar</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 5]} />
                        <Radar
                          name="Skills"
                          dataKey="score"
                          stroke="hsl(var(--p))"
                          fill="hsl(var(--p))"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {chartData.map((cat, idx) => (
                  <div key={idx} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg">
                          {cat.category}
                        </h4>
                        <span className="badge bg-royal-blue text-white badge-lg">
                          {cat.score} / 5.0
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={cat.percentage}
                        max="100"
                      ></progress>
                      <p className="text-sm text-base-content/70 mt-1">
                        {cat.percentage}% proficiency
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions justify-center mt-6">
                <button
                  onClick={resetAssessment}
                  className="btn btn-primary btn-wide"
                >
                  Retake Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const category = categories[currentCategory];
  const progress = ((Object.keys(responses).length / 40) * 100).toFixed(0);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-4xl font-bold justify-center mb-2">
              Skills Assessment
            </h1>
            <p className="text-center text-base-content/70 mb-6">
              This skill assessment quiz was developed by Mr. Edgar R. Eslit.
              All rights belong to the original creator. Used with permission
              for educational purposes.
            </p>
            <p className="text-center text-base-content/70 mb-6">
              Disclaimer: Participation in this quiz is entirely optional. Your
              responses are intended solely for self-assessment and personal
              development purposes. No grades, penalties, or formal evaluations
              will be based on your answers.
            </p>

            <div className="card mb-6">
              <div className="w-full">
                <p className="font-semibold mb-3">How to respond:</p>
                <p className="text-sm mb-3">
                  Rate each statement based on how well it describes you. Be
                  honest - there are no right or wrong answers.
                </p>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-bold">1</span> - Strongly Disagree
                  </div>
                  <div>
                    <span className="font-bold">2</span> - Disagree
                  </div>
                  <div>
                    <span className="font-bold">3</span> - Neutral
                  </div>
                  <div>
                    <span className="font-bold">4</span> - Agree
                  </div>
                  <div>
                    <span className="font-bold">5</span> - Strongly Agree
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-base-content/70 mb-2">
                <span>Progress: {progress}%</span>
                <span>{Object.keys(responses).length} / 40 questions</span>
              </div>
              <progress
                className="progress royal-blue w-full"
                value={progress}
                max="100"
              ></progress>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
              <div className="text-sm breadcrumbs">
                <ul>
                  <li>Category {currentCategory + 1} of 4</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              {category.questions.map((question, idx) => (
                <div key={idx} className="card bg-base-200">
                  <div className="card-body p-4">
                    <p className="font-medium mb-3">
                      {idx + 1}. {question}
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() =>
                            handleResponse(currentCategory, idx, value)
                          }
                          className={`btn flex-1 ${
                            responses[`${currentCategory}-${idx}`] === value
                              ? "btn-primary"
                              : "btn-outline"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-actions justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentCategory === 0}
                className="btn btn-outline"
              >
                ← Previous
              </button>

              {currentCategory < categories.length - 1 ? (
                <button onClick={handleNext} className="btn btn-primary">
                  Next Category →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered()}
                  className="btn btn-success"
                >
                  {saving
                    ? "Saving..."
                    : allQuestionsAnswered()
                      ? "Submit & Save Results"
                      : `Complete All (${40 - Object.keys(responses).length} left)`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillsAssessment;

import Assessment from "../models/Assessment.js";
import User from "../models/User.js";

// ===== SAVE ANNOUNCEMENT =====
export const saveAssessment = async (req, res) => {
  try {
    const { responses, scores, overallScore } = req.body;

    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await Assessment.findOneAndDelete({ user: req.session.userId });

    const assessment = new Assessment({
      user: req.session.userId,
      responses,
      scores,
      overallScore,
    });

    await assessment.save();

    await User.findByIdAndUpdate(req.session.userId, { hasAssessment: true });

    res
      .status(201)
      .json({ message: "Assessment saved successfully!", assessment });
  } catch (error) {
    console.error("Error saving assessment: ", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET ANNOUNCEMENT =====
export const getAssessment = async (req, res) => {
  try {
    const userId = req.params.userId || req.session.userId;
    const assessment = await Assessment.findOne({ user: userId });

    if (!assessment) {
      return res.status(404).json({ error: "No assessment found." });
    }

    res.json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment: ", error);
    res.status(500).json({ error: "Failed to fetch assessment." });
  }
};

// ===== DELETE ANNOUNCEMENT =====
export const deleteAssessment = async (req, res) => {
  try {
    await Assessment.findOneAndDelete({ user: req.session.userId });

    await User.findByIdAndUpdate(req.session.userId, { hasAssessment: false });
    res.json({ message: "Assessment  deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

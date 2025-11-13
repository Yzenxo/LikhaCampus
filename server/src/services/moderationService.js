import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const PERSPECTIVE_API_URL =
  "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";

// Toxicity thresholds (MODERATE settings as you requested)
const THRESHOLDS = {
  AUTO_HIDE: 0.8, // Moderate threshold - auto-hide if score >= 0.8
  FLAG: 0.5, // Flag for review but keep visible if score >= 0.5
};

/**
 * Check content toxicity using Perspective API
 * @param {string} text - Content to analyze
 * @returns {Object} - { toxicityScore, shouldFlag, shouldHide, attributes }
 */
export const checkToxicity = async (text) => {
  try {
    if (!PERSPECTIVE_API_KEY) {
      console.error("PERSPECTIVE_API_KEY not found in environment variables");
      return {
        toxicityScore: 0,
        shouldFlag: false,
        shouldHide: false,
        error: "API key not configured",
      };
    }

    const response = await axios.post(
      `${PERSPECTIVE_API_URL}?key=${PERSPECTIVE_API_KEY}`,
      {
        comment: { text },
        languages: ["en"],
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          IDENTITY_ATTACK: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {},
        },
      }
    );

    const scores = response.data.attributeScores;

    // Get individual scores
    const toxicity = scores.TOXICITY?.summaryScore?.value || 0;
    const severeToxicity = scores.SEVERE_TOXICITY?.summaryScore?.value || 0;
    const identityAttack = scores.IDENTITY_ATTACK?.summaryScore?.value || 0;
    const insult = scores.INSULT?.summaryScore?.value || 0;
    const profanity = scores.PROFANITY?.summaryScore?.value || 0;
    const threat = scores.THREAT?.summaryScore?.value || 0;

    // Use the highest score as overall toxicity
    const maxScore = Math.max(
      toxicity,
      severeToxicity,
      identityAttack,
      insult,
      profanity,
      threat
    );

    // Determine if content should be flagged or hidden
    const shouldHide = maxScore >= THRESHOLDS.AUTO_HIDE; // >= 0.8
    const shouldFlag = maxScore >= THRESHOLDS.FLAG; // >= 0.5

    // Determine specific reason for flagging
    let flagReason = "";
    if (severeToxicity >= THRESHOLDS.AUTO_HIDE) {
      flagReason = "severe_toxicity";
    } else if (threat >= THRESHOLDS.AUTO_HIDE) {
      flagReason = "threat";
    } else if (identityAttack >= THRESHOLDS.AUTO_HIDE) {
      flagReason = "identity_attack";
    } else if (profanity >= THRESHOLDS.AUTO_HIDE) {
      flagReason = "profanity";
    } else if (insult >= THRESHOLDS.AUTO_HIDE) {
      flagReason = "insult";
    } else if (toxicity >= THRESHOLDS.AUTO_HIDE) {
      flagReason = "toxicity";
    }

    return {
      toxicityScore: maxScore,
      shouldFlag,
      shouldHide,
      flagReason,
      attributes: {
        toxicity,
        severeToxicity,
        identityAttack,
        insult,
        profanity,
        threat,
      },
    };
  } catch (error) {
    console.error(
      "Perspective API error:",
      error.response?.data || error.message
    );

    // Return safe defaults on error (don't block content if API fails)
    return {
      toxicityScore: 0,
      shouldFlag: false,
      shouldHide: false,
      error: error.message,
      attributes: {},
    };
  }
};

/**
 * Moderate forum post content (title + content)
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @returns {Object} - Moderation result
 */
export const moderatePost = async (title, content) => {
  const fullText = `${title} ${content}`;
  return await checkToxicity(fullText);
};

/**
 * Moderate comment/reply content
 * @param {string} content - Comment content
 * @returns {Object} - Moderation result
 */
export const moderateComment = async (content) => {
  return await checkToxicity(content);
};

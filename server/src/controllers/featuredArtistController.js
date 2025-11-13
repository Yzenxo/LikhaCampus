import {
  getCurrentFeaturedArtist,
  getFeaturedArtistHistory,
  selectFeaturedArtist,
} from "../services/featuredArtistService.js";

// ===== GET CURRENT FEATURED ARTIST =====
export const getCurrent = async (req, res) => {
  try {
    const featuredArtist = await getCurrentFeaturedArtist();

    if (!featuredArtist) {
      return res.status(404).json({
        message: "No featured artist for this week",
      });
    }

    res.json({
      featuredArtist: {
        _id: featuredArtist._id,
        user: featuredArtist.user,
        projectCount: featuredArtist.projectCount,
        startDate: featuredArtist.startDate,
        endDate: featuredArtist.endDate,
        week: featuredArtist.week,
        year: featuredArtist.year,
      },
    });
  } catch (error) {
    console.error("Error fetching current featured artist:", error);
    res.status(500).json({ error: "Failed to fetch featured artist" });
  }
};

// ===== GET PAST FEATURED ARTIST HISTORY =====
export const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await getFeaturedArtistHistory(limit);

    res.json({
      history: history.map((fa) => ({
        _id: fa._id,
        user: fa.user,
        projectCount: fa.projectCount,
        startDate: fa.startDate,
        endDate: fa.endDate,
        week: fa.week,
        year: fa.year,
      })),
    });
  } catch (error) {
    console.error("Error fetching featured artist history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

// ===== CHECK IF USER IS FEATURED =====
export const checkIfFeatured = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const featuredArtist = await getFeaturedArtistHistory(1);

    if (!featuredArtist || featuredArtist.length === 0) {
      return res.json({ isFeatured: false });
    }

    const current = featuredArtist[0];

    const isWithinRange =
      new Date(current.startDate) <= now && new Date(current.endDate) >= now;

    const isFeatured = current.user._id.toString() === userId && isWithinRange;

    res.json({
      isFeatured,
      featuredData: isFeatured
        ? {
            week: current.week,
            year: current.year,
            startDate: current.startDate,
            endDate: current.endDate,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking featured status:", error);
    res.status(500).json({ error: "Failed to check featured status" });
  }
};

// ===== MANUAL SET FEATURED ARTIST =====
export const manualSelect = async (req, res) => {
  try {
    const featuredArtist = await selectFeaturedArtist();

    if (!featuredArtist) {
      return res.status(404).json({
        message: "No eligible artists found for this week",
      });
    }

    res.json({
      message: "Featured artist selected successfully",
      featuredArtist: {
        _id: featuredArtist._id,
        user: featuredArtist.user,
        projectCount: featuredArtist.projectCount,
        startDate: featuredArtist.startDate,
        endDate: featuredArtist.endDate,
        week: featuredArtist.week,
        year: featuredArtist.year,
      },
    });
  } catch (error) {
    console.error("Error manually selecting featured artist:", error);
    res.status(500).json({ error: "Failed to select featured artist" });
  }
};

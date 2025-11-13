import cron from "node-cron";
import {
  getCurrentFeaturedArtist,
  selectFeaturedArtist,
} from "../services/featuredArtistService.js";

/**
 * Initialize featured artist on server startup
 */
const initializeFeaturedArtist = async () => {
  try {
    // First check if there's a current featured artist
    let currentFeatured = await getCurrentFeaturedArtist();

    if (!currentFeatured) {
      // No featured artist for current period, select one now
      console.log(
        "No featured artist found for current week, selecting one now..."
      );
      currentFeatured = await selectFeaturedArtist();

      if (currentFeatured) {
        console.log(
          `Featured artist selected: ${currentFeatured.user.firstName} ${currentFeatured.user.lastName} (@${currentFeatured.user.username})`
        );
      } else {
        console.log("No eligible artist found");
      }
    } else {
      console.log(
        `Current featured artist: ${currentFeatured.user.firstName} ${currentFeatured.user.lastName} (@${currentFeatured.user.username})`
      );
      console.log(
        `Featured until: ${currentFeatured.endDate.toLocaleDateString()}`
      );
    }

    return currentFeatured;
  } catch (error) {
    console.error("Error initializing featured artist:", error);
    return null;
  }
};

/**
 * Schedule featured artist selection
 * Runs every Monday at 00:00 (midnight)
 */
export const scheduleFeaturedArtistSelection = () => {
  // Initialize on startup (check for current or select new)
  initializeFeaturedArtist();

  // Schedule weekly selection every Monday at midnight
  cron.schedule("0 0 * * 1", async () => {
    console.log("Running weekly featured artist selection...");

    try {
      const featuredArtist = await selectFeaturedArtist();

      if (featuredArtist) {
        console.log(
          `Featured artist selected: ${featuredArtist.user.firstName} ${featuredArtist.user.lastName} (@${featuredArtist.user.username})`
        );
      } else {
        console.log("No eligible artist found for this week");
      }
    } catch (error) {
      console.error("Error in featured artist cron job:", error);
    }
  });

  console.log(
    "Featured Artist scheduler initialized (runs every Monday at midnight)"
  );
};

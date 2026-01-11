import cron from "node-cron";
import {
  createTopArtistsSnapshot,
  getTopArtistsByUpvotes,
} from "../services/featuredArtistService.js";

/**
 * Initialize featured artists on server startup
 */
const initializeFeaturedArtists = async () => {
  try {
    console.log("\n🎨 Initializing Featured Artists System...");

    // Check if we have current snapshots, if not create them
    const topWeekly = await getTopArtistsByUpvotes("week");
    const topMonthly = await getTopArtistsByUpvotes("month");

    if (topWeekly && topWeekly.length > 0) {
      console.log("\n📊 Current Top Artists (Weekly):");
      topWeekly.forEach((artist, index) => {
        console.log(
          `  ${index + 1}. ${artist.user.firstName} ${artist.user.lastName} (@${artist.user.username}) - ${artist.totalUpvotes} upvotes, ${artist.projectCount} projects`
        );
      });
    } else {
      console.log("⚠️  No weekly top artists found");
    }

    if (topMonthly && topMonthly.length > 0) {
      console.log("\n📊 Current Top Artists (Monthly):");
      topMonthly.forEach((artist, index) => {
        console.log(
          `  ${index + 1}. ${artist.user.firstName} ${artist.user.lastName} (@${artist.user.username}) - ${artist.totalUpvotes} upvotes, ${artist.projectCount} projects`
        );
      });
    } else {
      console.log("⚠️  No monthly top artists found");
    }

    return { topWeekly, topMonthly };
  } catch (error) {
    console.error("❌ Error initializing featured artists:", error);
    return null;
  }
};

/**
 * Schedule featured artist updates
 */
export const scheduleFeaturedArtistSelection = () => {
  // Initialize on startup
  initializeFeaturedArtists();

  // ===== WEEKLY SNAPSHOT: Every Monday at 00:01 (12:01 AM) =====
  cron.schedule("1 0 * * 1", async () => {
    console.log("\n⏰ Running WEEKLY Top 3 Artists snapshot...");

    try {
      const snapshot = await createTopArtistsSnapshot("week");

      if (snapshot && snapshot.rankings.length > 0) {
        console.log("✅ Weekly Top 3 snapshot created:");
        snapshot.rankings.forEach((ranking) => {
          console.log(
            `  ${ranking.rank}. ${ranking.user.firstName} ${ranking.user.lastName} (@${ranking.user.username}) - ${ranking.totalUpvotes} upvotes`
          );
        });
      } else {
        console.log("⚠️  No artists found for weekly snapshot");
      }
    } catch (error) {
      console.error("❌ Error in weekly snapshot cron job:", error);
    }
  });

  // ===== MONTHLY SNAPSHOT: 1st of every month at 00:02 (12:02 AM) =====
  cron.schedule("2 0 1 * *", async () => {
    console.log("\n⏰ Running MONTHLY Top 3 Artists snapshot...");

    try {
      const snapshot = await createTopArtistsSnapshot("month");

      if (snapshot && snapshot.rankings.length > 0) {
        console.log("✅ Monthly Top 3 snapshot created:");
        snapshot.rankings.forEach((ranking) => {
          console.log(
            `  ${ranking.rank}. ${ranking.user.firstName} ${ranking.user.lastName} (@${ranking.user.username}) - ${ranking.totalUpvotes} upvotes`
          );
        });
      } else {
        console.log("⚠️  No artists found for monthly snapshot");
      }
    } catch (error) {
      console.error("❌ Error in monthly snapshot cron job:", error);
    }
  });

  console.log(
    "✅ Featured Artist scheduler initialized:\n" +
      "   📅 Weekly snapshots: Every Monday at 12:01 AM\n" +
      "   📅 Monthly snapshots: 1st of month at 12:02 AM"
  );
};

/**
 * Manual trigger function (for testing or admin use)
 */
export const triggerSnapshotNow = async (timeframe = "week") => {
  console.log(`\n🚀 Manually triggering ${timeframe} snapshot...`);

  try {
    const snapshot = await createTopArtistsSnapshot(timeframe);

    if (snapshot) {
      console.log(`✅ ${timeframe} snapshot created successfully`);
      return snapshot;
    } else {
      console.log(`⚠️  No snapshot created`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ${timeframe} snapshot:`, error);
    throw error;
  }
};

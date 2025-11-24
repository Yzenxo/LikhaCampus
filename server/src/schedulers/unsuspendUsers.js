// cron/unSuspendUsers.js
import cron from "node-cron";
import User from "../models/User.js";

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Find users whose suspension duration ended
    const usersToUnsuspend = await User.find({
      isSuspended: true,
      suspensionDate: { $exists: true },
      suspensionDuration: { $exists: true },
      $expr: {
        $lte: [
          {
            $add: [
              "$suspensionDate",
              { $multiply: ["$suspensionDuration", 1000 * 60 * 60] },
            ],
          },
          now,
        ],
      },
    });

    for (const user of usersToUnsuspend) {
      user.isSuspended = false;
      user.suspensionReason = undefined;
      user.suspensionDate = undefined;
      user.suspensionDuration = undefined;
      await user.save();
      console.log(`Auto un-suspended user ${user.username}`);
    }
  } catch (err) {
    console.error("Error auto un-suspending users:", err);
  }
});

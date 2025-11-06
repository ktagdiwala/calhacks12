const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Utility function to format the time elapsed since a given date
function formatLastActivity(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

// Get weekly statistics
router.get("/weekly-stats/:userId", async (req, res) => {
  try {
    // console.log('Weekly stats requested for userId:', req.params.userId);

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      console.log("Invalid user ID format:", req.params.userId);
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // console.log('Found user:', user);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get logs with their associated questions to differentiate between flashcards and quizzes
    // First get all logs for the past week
    const logs = await prisma.log.findMany({
      where: {
        userId,
        timestamp: {
          gte: oneWeekAgo,
        },
      },
    });

    // console.log('Analytics - Found logs:', {
    //   userId,
    //   totalLogs: logs.length,
    //   timeframe: {
    //     from: oneWeekAgo,
    //     to: new Date()
    //   }
    // });

    // Get all quiz questions to identify which logs are for quizzes
    const quizQuestionIds = await prisma.quizQuestion.findMany({
      where: { userId },
      select: { id: true },
    });
    const quizIds = new Set(quizQuestionIds.map((q) => q.id));

    // Count flashcards vs quiz completions
    const cardsLogs = logs.filter((log) => !quizIds.has(log.questionId));
    const quizLogs = logs.filter((log) => quizIds.has(log.questionId));
    const totalCards = cardsLogs.length;
    const quizzesCompleted = quizLogs.length;

    // console.log('Analytics - Activity breakdown:', {
    //   totalLogs: logs.length,
    //   totalCards,
    //   quizzesCompleted,
    //   sampleCardLog: cardsLogs[0],
    //   sampleQuizLog: quizLogs[0]
    // });

    // console.log('Analytics - Counted activities:', {
    //   totalCards,
    //   quizzesCompleted,
    //   logSamples: {
    //     card: cardsLogs[0],
    //     quiz: quizLogs[0]
    //   }
    // });

    // Get average confidence (using distance until next date as a proxy)
    const confidenceLogs = await prisma.log.findMany({
      where: {
        userId,
        timestamp: {
          gte: oneWeekAgo,
        },
      },
      select: {
        distanceUntilNextDate: true,
      },
    });

    // Calculate average confidence on a scale of 0-4
    let averageConfidence = 0;
    if (confidenceLogs.length > 0) {
      const totalDistance = confidenceLogs.reduce(
        (acc, log) => acc + (log.distanceUntilNextDate || 0),
        0
      );
      const avgDistance = totalDistance / confidenceLogs.length;
      // Convert average distance (in days) to a 0-4 scale
      averageConfidence = Math.min(
        4,
        Math.round(((4 * avgDistance) / 7) * 10) / 10
      );
    }

    // Get number of unique topics studied (as a proxy for tutoring sessions)
    const uniqueTags = await prisma.log.findMany({
      where: {
        userId,
        timestamp: {
          gte: oneWeekAgo,
        },
      },
      distinct: ["tagId"],
      select: {
        tagId: true,
      },
    });

    const tutoringSessions = uniqueTags.length;

    res.json({
      totalCards,
      quizzesCompleted,
      tutoringSessions,
      averageConfidence,
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ error: "Failed to fetch weekly statistics" });
  }
});

// Get topic progress
router.get("/topic-progress/:userId", async (req, res) => {
  try {
    // console.log('Topic progress requested for userId:', req.params.userId);

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      console.log("Invalid user ID format:", req.params.userId);
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user:", user);

    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
      include: {
        logs: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        },
      },
    });

    const topicProgress = await Promise.all(
      tags.map(async (tag) => {
        // Get all logs for this tag
        const logs = await prisma.log.findMany({
          where: {
            tagId: tag.id,
            userId,
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        // console.log('Tag progress calculation:', {
        //   tagId: tag.id,
        //   tagName: tag.name,
        //   totalLogs: logs.length,
        //   recentLog: logs[0]
        // });

        // Calculate progress based on:
        // 1. Recent activity (last 7 days)
        // 2. Study consistency (streak)
        // 3. Average confidence (distanceUntilNextDate)
        const recentLogs = logs.filter((log) => {
          const logDate = new Date(log.timestamp);
          const daysDiff =
            (Date.now() - logDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7;
        });

        const recentActivityScore = Math.min(50, recentLogs.length * 5); // Up to 50 points from recent activity
        const avgConfidence =
          logs.length > 0
            ? Math.min(
                25,
                (logs.reduce((sum, log) => sum + log.distanceUntilNextDate, 0) /
                  logs.length) *
                  5
              )
            : 0; // Up to 25 points from confidence

        // Calculate progress (0-100)
        const progress = Math.round(recentActivityScore + avgConfidence);

        // Calculate streak based on consecutive days with logs
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < logs.length; i++) {
          const logDate = new Date(logs[i].timestamp);
          if (
            (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24) <=
            i + 1
          ) {
            streak++;
          } else {
            break;
          }
        }

        // Determine time of day based on progress
        let timeOfDay;
        if (progress < 25) timeOfDay = "twilight";
        else if (progress < 50) timeOfDay = "dawn";
        else if (progress < 75) timeOfDay = "morning";
        else timeOfDay = "day";

        // Format last activity
        const lastActivity = logs[0]
          ? formatLastActivity(new Date(logs[0].timestamp))
          : "No activity yet";

        return {
          name: tag.name,
          progress,
          streak,
          lastActivity,
          timeOfDay,
        };
      })
    );

    res.json(topicProgress);
  } catch (error) {
    console.error("Error fetching topic progress:", error);
    res.status(500).json({ error: "Failed to fetch topic progress" });
  }
});

// Debug route to check logs directly
router.get("/debug/logs/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all logs for debugging
    const logs = await prisma.log.findMany({
      where: {
        userId,
        timestamp: {
          gte: oneWeekAgo,
        },
      },
      include: {
        question: true,
        tag: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tags: true,
      },
    });

    res.json({
      user,
      logsCount: logs.length,
      recentLogs: logs.slice(0, 5), // Show last 5 logs
      timeframe: {
        from: oneWeekAgo,
        to: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

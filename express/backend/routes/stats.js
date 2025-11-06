const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

/* GET stats for user - 7 day review count */
router.get("/user/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Total items reviewed in last 7 days
    const logsLastWeek = await prisma.log.findMany({
      where: {
        userId,
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Count by type
    const flashcardsReviewed = await prisma.flashcard.count({
      where: {
        tag: {
          userId,
        },
      },
    });

    const quizQuestionsCount = await prisma.quizQuestion.count({
      where: {
        userId,
      },
    });

    res.json({
      totalItemsReviewedLast7Days: logsLastWeek.length,
      totalFlashcards: flashcardsReviewed,
      totalQuizQuestions: quizQuestionsCount,
      logsLastWeek: logsLastWeek.length,
    });
  } catch (error) {
    next(error);
  }
});

/* GET average confidence for flashcards by tag */
router.get("/confidence/tag/:tagId/user/:userId", async (req, res, next) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const userId = parseInt(req.params.userId);

    // Verify tag belongs to user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!tag) {
      return res.status(403).json({ error: "Tag not found or unauthorized" });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { tagId },
    });

    const averageConfidence =
      flashcards.length > 0
        ? flashcards.reduce((sum, fc) => sum + (fc.rating || 3), 0) /
          flashcards.length
        : 0;

    res.json({
      tagId,
      tagName: tag.name,
      averageConfidence: parseFloat(averageConfidence.toFixed(2)),
      totalFlashcards: flashcards.length,
    });
  } catch (error) {
    next(error);
  }
});

/* GET topic mastery percentage */
router.get("/mastery/tag/:tagId/user/:userId", async (req, res, next) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const userId = parseInt(req.params.userId);

    // Verify tag belongs to user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
      include: {
        flashcards: true,
        quizQuestions: true,
      },
    });

    if (!tag) {
      return res.status(403).json({ error: "Tag not found or unauthorized" });
    }

    const totalItems =
      (tag.flashcards ? tag.flashcards.length : 0) +
      (tag.quizQuestions ? tag.quizQuestions.length : 0);

    // Consider items with rating 4+ as mastered
    const masteredFlashcards = (tag.flashcards || []).filter(
      (fc) => (fc.rating || 0) >= 4
    ).length;

    const masteryPercentage =
      totalItems > 0 ? (masteredFlashcards / totalItems) * 100 : 0;

    res.json({
      tagId,
      tagName: tag.name,
      totalItems,
      masteredItems: masteredFlashcards,
      masteryPercentage: parseFloat(masteryPercentage.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

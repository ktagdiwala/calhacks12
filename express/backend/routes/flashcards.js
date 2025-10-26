var express = require("express");
var router = express.Router();
const prisma = require("../lib/prisma");
const { authenticateUser } = require("../middleware/auth");

// Spaced Repetition Algorithm
// Confidence levels: 1 (low) to 4 (high)
// Days until next review increases with confidence
function calculateNextReviewDays(confidence) {
  const daysMap = {
    1: 1, // Low confidence - review tomorrow
    2: 2, // Below average - review in 2 days
    3: 4, // Average - review in 4 days
    4: 7, // Good - review in 7 days
  };
  return daysMap[confidence] || 1;
}

// Determine question format based on confidence level
function getQuestionFormat(confidence) {
  const formatMap = {
    1: "FLASHCARD", // Low confidence
    2: "FLASHCARD", // Below average
    3: "MULTIPLE_CHOICE", // Average
    4: "EXPLAIN_PROMPT", // Good
  };
  return formatMap[confidence] || "FLASHCARD";
}

/* GET flashcards with tagId and userId - PUBLIC */
router.get("/tag/:tagId/user/:userId", async (req, res, next) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const userId = parseInt(req.params.userId);

    // Get all flashcards for this tag
    const flashcards = await prisma.flashcard.findMany({
      where: {
        tagId,
        tag: {
          userId,
        },
      },
      include: {
        tag: true,
      },
    });

    res.json(flashcards);
  } catch (error) {
    next(error);
  }
});

/* POST new flashcard - PUBLIC */
router.post("/", async (req, res, next) => {
  try {
    const { information, tagId, userId } = req.body;

    if (!information) {
      return res
        .status(400)
        .json({ error: "Flashcard information is required" });
    }

    if (!tagId) {
      return res.status(400).json({ error: "tagId is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

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

    // Create new flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        information,
        rating: 3, // Default to neutral confidence
        tagId,
      },
      include: {
        tag: true,
      },
    });

    res.status(201).json({
      message: "Flashcard created successfully",
      flashcard,
    });
  } catch (error) {
    next(error);
  }
});

/* POST rating for flashcard - PUBLIC */
router.post("/:flashcardId/rating", async (req, res, next) => {
  try {
    const flashcardId = parseInt(req.params.flashcardId);
    const { confidence, userId } = req.body;

    if (!confidence || confidence < 1 || confidence > 4) {
      return res
        .status(400)
        .json({ error: "Confidence must be between 1 and 4" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get flashcard and verify user owns the tag
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: { tag: true },
    });

    if (!flashcard) {
      return res.status(404).json({ error: "Flashcard not found" });
    }

    if (flashcard.tag.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update flashcard rating
    const updated = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        rating: confidence,
      },
      include: { tag: true },
    });

    // Create log entry for spaced repetition
    const daysUntilNext = calculateNextReviewDays(confidence);

    res.json({
      message: "Rating updated successfully",
      flashcard: updated,
      nextReviewInDays: daysUntilNext,
    });
  } catch (error) {
    next(error);
  }
});

/* GET quiz questions with userId - PUBLIC */
router.get("/questions/user/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const questions = await prisma.quizQuestion.findMany({
      where: {
        tag: {
          userId,
        },
      },
      include: {
        tag: true,
      },
    });

    res.json(questions);
  } catch (error) {
    next(error);
  }
});

/* GET quiz questions for a specific tag - PUBLIC */
router.get("/questions/tag/:tagId/user/:userId", async (req, res, next) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const userId = parseInt(req.params.userId);

    const questions = await prisma.quizQuestion.findMany({
      where: {
        tagId,
        tag: {
          userId,
        },
      },
      include: {
        tag: true,
      },
    });

    res.json(questions);
  } catch (error) {
    next(error);
  }
});

/* POST new quiz question - PUBLIC */
router.post("/questions", async (req, res, next) => {
  try {
    const { question, correctAnswer, type, tagId, userId, explanation } =
      req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!correctAnswer) {
      return res.status(400).json({ error: "Correct answer is required" });
    }

    if (!type) {
      return res.status(400).json({ error: "Question type is required" });
    }

    if (!tagId) {
      return res.status(400).json({ error: "tagId is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

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

    // Create new quiz question
    const newQuestion = await prisma.quizQuestion.create({
      data: {
        question,
        correctAnswer,
        type,
        explanation: explanation || null,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    res.status(201).json({
      message: "Quiz question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    next(error);
  }
});

/* POST answer and check if correct - PUBLIC */
router.post("/questions/:questionId/answer", async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const { userAnswer, userId } = req.body;

    if (!userAnswer) {
      return res.status(400).json({ error: "User answer is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get question and verify user owns the tag
    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { tag: true },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.tag.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if answer is correct (case-insensitive)
    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

    // Determine confidence based on correctness
    const confidence = isCorrect ? 4 : 1;
    const daysUntilNext = calculateNextReviewDays(confidence);

    // Create log entry for spaced repetition
    const log = await prisma.log.create({
      data: {
        userId,
        tagId: question.tagId,
        questionId,
        distanceUntilNextDate: daysUntilNext,
      },
    });

    res.json({
      message: isCorrect ? "Correct!" : "Incorrect",
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      nextReviewInDays: daysUntilNext,
      confidence,
      suggestedFormat: getQuestionFormat(confidence),
    });
  } catch (error) {
    next(error);
  }
});

/* GET stats for user - 7 day review count - PUBLIC */
router.get("/stats/user/:userId", async (req, res, next) => {
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
        tag: {
          userId,
        },
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

/* GET average confidence for flashcards by tag - PUBLIC */
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

/* GET topic mastery percentage - PUBLIC */
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
      (tag.flashcards?.length || 0) + (tag.quizQuestions?.length || 0);

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

/* GET all tags for userId - PUBLIC */
router.get("/tags/user/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        flashcards: true,
        quizQuestions: true,
      },
    });

    res.json(tags);
  } catch (error) {
    next(error);
  }
});

/* POST new tag for userId - PUBLIC */
router.post("/tags", async (req, res, next) => {
  try {
    const { name, description, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if tag already exists for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existingTag) {
      return res
        .status(400)
        .json({ error: "Tag already exists for this user" });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        description: description || null,
        userId,
      },
      include: {
        flashcards: true,
        quizQuestions: true,
      },
    });

    res.status(201).json({
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

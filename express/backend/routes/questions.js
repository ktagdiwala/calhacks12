const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Spaced Repetition Algorithm for quiz questions
function calculateNextReviewDays(confidence) {
  const daysMap = {
    1: 1, // Low confidence - review tomorrow
    2: 2, // Below average - review in 2 days
    3: 4, // Average - review in 4 days
    4: 7, // Good - review in 7 days
  };
  return daysMap[confidence] || 1;
}

/* GET all quiz questions for user */
router.get("/user/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const questions = await prisma.quizQuestion.findMany({
      where: {
        userId,
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

/* GET quiz questions for a specific tag */
router.get("/tag/:tagId/user/:userId", async (req, res, next) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const userId = parseInt(req.params.userId);

    const questions = await prisma.quizQuestion.findMany({
      where: {
        userId,
        tagId,
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

/* POST new quiz question */
router.post("/", async (req, res, next) => {
  try {
    const {
      question,
      correctAnswer,
      type,
      tagId,
      userId,
      explanation,
      options,
    } = req.body;

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

    const newQuestion = await prisma.quizQuestion.create({
      data: {
        question,
        correctAnswer,
        type,
        explanation: explanation || null,
        options: options || [],
        userId,
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

/* POST answer and check if correct */
router.post("/:questionId/answer", async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const { userAnswer, userId } = req.body;

    if (!userAnswer) {
      return res.status(400).json({ error: "User answer is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get question and verify user owns the question
    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { tag: true },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.userId !== userId) {
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
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { authenticateUser } = require("../middleware/auth");

/**
 * GET /api/ai/tags
 * Query parameters: name (string), userId (string)
 * Returns tag ID by topic name and userId
 */
router.get("/tags", async (req, res, next) => {
  try {
    const { name, userId } = req.query;

    // Validate required parameters
    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Convert userId to integer if it's a string
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    // Find the tag by name and userId
    const tag = await prisma.tag.findFirst({
      where: {
        name: name,
        userId: userIdInt,
      },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found for this user" });
    }

    res.json({ id: tag.id, name: tag.name, userId: tag.userId });
  } catch (error) {
    console.error("Error fetching tag:", error);
    next(error);
  }
});

/**
 * POST /api/ai/flashcards
 * Body: { topic, content_type, flashcards: [ { information, tagId }, ... ], userId }
 * Creates multiple flashcards from AI response
 */
router.post("/flashcards", async (req, res, next) => {
  try {
    const { topic, content_type, flashcards, userId } = req.body;

    // Validate required parameters
    if (!Array.isArray(flashcards)) {
      return res.status(400).json({ error: "flashcards must be an array" });
    }
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Create flashcards in bulk
    const createdFlashcards = await Promise.all(
      flashcards.map(async (flashcard) => {
        const { information, tagId } = flashcard;

        // Verify tag belongs to user
        const tag = await prisma.tag.findFirst({
          where: {
            id: tagId,
            userId: parseInt(userId, 10),
          },
        });

        if (!tag) {
          throw new Error(
            `Tag ${tagId} not found or unauthorized for user ${userId}`
          );
        }

        // Create flashcard
        return await prisma.flashcard.create({
          data: {
            information,
            rating: 3, // Default neutral confidence
            tagId,
          },
          include: {
            tag: true,
          },
        });
      })
    );

    res.status(201).json({
      message: `${createdFlashcards.length} flashcards created successfully`,
      topic,
      content_type,
      count: createdFlashcards.length,
      flashcards: createdFlashcards,
    });
  } catch (error) {
    console.error("Error creating flashcards:", error);
    next(error);
  }
});

/**
 * POST /api/ai/quiz-questions
 * Body: { topic, content_type, quiz_questions: [ { question, correctAnswer, type, explanation, options, tagId }, ... ], userId }
 * Creates multiple quiz questions from AI response
 */
router.post("/quiz-questions", async (req, res, next) => {
  try {
    const { topic, content_type, quiz_questions, userId } = req.body;
    // console.log("Received quiz questions:", quiz_questions.map(q => q.options));
    // Validate required parameters
    if (!Array.isArray(quiz_questions)) {
      return res.status(400).json({ error: "quiz_questions must be an array" });
    }
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Create quiz questions in bulk
    const createdQuestions = await Promise.all(
      quiz_questions.map(async (questionData) => {
        const { question, correctAnswer, type, explanation, options, tagId } =
          questionData;

        // Verify tag belongs to user
        const tag = await prisma.tag.findFirst({
          where: {
            id: tagId,
            userId: parseInt(userId, 10),
          },
        });

        if (!tag) {
          throw new Error(
            `Tag ${tagId} not found or unauthorized for user ${userId}`
          );
        }

        // Normalize type: convert FILL_IN_THE_BLANK and CALCULATION to FILL_IN_BLANK
        let normalizedType = type.toUpperCase();
        if (
          normalizedType === "FILL_IN_THE_BLANK" ||
          normalizedType === "CALCULATION"
        ) {
          normalizedType = "FILL_IN_BLANK";
        }

        // Create quiz question
        return await prisma.quizQuestion.create({
          data: {
            question,
            correctAnswer,
            type: normalizedType,
            explanation: explanation || null,
            options: Array.isArray(options) ? options : [],
            userId: parseInt(userId, 10),
            tagId,
          },
          include: {
            tag: true,
          },
        });
      })
    );

    res.status(201).json({
      message: `${createdQuestions.length} quiz questions created successfully`,
      topic,
      content_type,
      count: createdQuestions.length,
      quiz_questions: createdQuestions,
    });
  } catch (error) {
    console.error("Error creating quiz questions:", error);
    next(error);
  }
});

module.exports = router;

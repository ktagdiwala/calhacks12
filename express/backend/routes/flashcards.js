const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

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

// Get a list of 3 random tags for a user
async function getRandomTags(userId, count = 3) {
  const allTags = await prisma.tag.findMany({
    where: { userId },
  });

  if (allTags.length === 0) return [];

  // Shuffle and return random tags
  const shuffled = allTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, allTags.length));
}

// Get questions to show based on average distanceUntilNextDate from past 7 days logs
async function getQuestionsToShow(userId, simulateDays) {
  try {
    // Get 3 random tags
    const randomTags = await getRandomTags(userId, 3);

    if (randomTags.length === 0) {
      return [];
    }

    const questionsToShow = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Process each tag
    for (const tag of randomTags) {
      // Get logs from past 7 days for this tag
      const logsForTag = await prisma.log.findMany({
        where: {
          userId,
          tagId: tag.id,
          timestamp: {
            gte: sevenDaysAgo,
          },
        },
      });

      // Calculate average distanceUntilNextDate
      let averageDistance = 0;
      if (logsForTag.length > 0) {
        const totalDistance = logsForTag.reduce(
          (sum, log) => sum + log.distanceUntilNextDate,
          0
        );
        averageDistance = totalDistance / logsForTag.length;
      }

      // Determine which question types to serve based on average distance
      let questionTypesToServe = [];

      if (averageDistance > 5) {
        // Serve EXPLAIN_PROMPT questions
        questionTypesToServe = ["EXPLAIN_PROMPT"];
      } else if (averageDistance > 2) {
        // Serve FILL_IN_BLANK or MULTIPLE_CHOICE questions
        questionTypesToServe = ["FILL_IN_BLANK", "MULTIPLE_CHOICE"];
      } else {
        // Show only flashcards for this tag
        questionTypesToServe = ["FLASHCARD"];
      }

      // Get appropriate questions based on the thresholds
      if (questionTypesToServe.includes("FLASHCARD")) {
        // Get flashcards for this tag
        const flashcards = await prisma.flashcard.findMany({
          where: {
            tagId: tag.id,
          },
          include: {
            tag: true,
          },
        });

        flashcards.forEach((flashcard) => {
          questionsToShow.push({
            id: flashcard.id,
            question: flashcard.information,
            typeOfQuestion: "FLASHCARD",
            confidence: flashcard.rating || 3,
            tagId: tag.id,
            tagName: tag.name,
            averageDistance,
          });
        });
      } else {
        // Get quiz questions of the specified types for this tag
        const quizQuestions = await prisma.quizQuestion.findMany({
          where: {
            userId,
            tagId: tag.id,
            type: {
              in: questionTypesToServe,
            },
          },
          include: {
            tag: true,
          },
        });

        quizQuestions.forEach((question) => {
          const questionObj = {
            id: question.id,
            question: question.question,
            typeOfQuestion: question.type,
            confidence: 3, // Default confidence
            tagId: tag.id,
            tagName: tag.name,
            averageDistance,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
          };

          // Include options if available
          if (question.options && question.options.length > 0) {
            questionObj.options = question.options;
          }

          questionsToShow.push(questionObj);
        });
      }
    }

    return questionsToShow;
  } catch (error) {
    console.error("Error getting questions to show:", error);
    return [];
  }
}

/* GET flashcards with tagId and userId */
router.get("/tag/:tagId/user/:userId", async (req, res, next) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const userId = parseInt(req.params.userId);

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

/* POST new flashcard */
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

/* POST rating for flashcard */
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

    const log = await prisma.log.create({
      data: {
        userId,
        tagId: flashcard.tagId,
        questionId: flashcardId,
        distanceUntilNextDate: daysUntilNext,
      },
    });

    res.json({
      message: "Rating updated successfully",
      flashcard: updated,
      nextReviewInDays: daysUntilNext,
      log,
    });
  } catch (error) {
    next(error);
  }
});

/* GET questions to show for user based on spaced repetition */
router.get("/show/user/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    // Get 3 random tags
    const allTags = await prisma.tag.findMany({
      where: { userId },
    });

    if (allTags.length === 0) {
      return res.json({ count: 0, questions: [] });
    }

    const shuffled = allTags.sort(() => 0.5 - Math.random());
    const randomTags = shuffled.slice(0, Math.min(3, allTags.length));

    const questionsToShow = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Process each tag
    for (const tag of randomTags) {
      // Get logs from past 7 days for this tag
      const logsForTag = await prisma.log.findMany({
        where: {
          userId,
          tagId: tag.id,
          timestamp: {
            gte: sevenDaysAgo,
          },
        },
      });

      // Calculate average distanceUntilNextDate
      let averageDistance = 0;
      if (logsForTag.length > 0) {
        const totalDistance = logsForTag.reduce(
          (sum, log) => sum + log.distanceUntilNextDate,
          0
        );
        averageDistance = totalDistance / logsForTag.length;
      }

      // Determine which question types to serve based on average distance
      let questionTypesToServe = [];

      if (averageDistance > 5) {
        questionTypesToServe = ["EXPLAIN_PROMPT"];
      } else if (averageDistance > 2) {
        questionTypesToServe = ["FILL_IN_BLANK", "MULTIPLE_CHOICE"];
      } else {
        questionTypesToServe = ["FLASHCARD"];
      }

      // Get appropriate questions based on the thresholds
      if (questionTypesToServe.includes("FLASHCARD")) {
        const flashcards = await prisma.flashcard.findMany({
          where: {
            tagId: tag.id,
          },
          include: {
            tag: true,
          },
        });

        flashcards.forEach((flashcard) => {
          questionsToShow.push({
            id: flashcard.id,
            question: flashcard.information,
            typeOfQuestion: "FLASHCARD",
            confidence: flashcard.rating || 3,
            tagId: tag.id,
            tagName: tag.name,
            averageDistance,
          });
        });
      } else {
        const quizQuestions = await prisma.quizQuestion.findMany({
          where: {
            userId,
            tagId: tag.id,
            type: {
              in: questionTypesToServe,
            },
          },
          include: {
            tag: true,
          },
        });

        quizQuestions.forEach((question) => {
          const questionObj = {
            id: question.id,
            question: question.question,
            typeOfQuestion: question.type,
            confidence: 3,
            tagId: tag.id,
            tagName: tag.name,
            averageDistance,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
          };

          if (question.options && question.options.length > 0) {
            questionObj.options = question.options;
          }

          questionsToShow.push(questionObj);
        });
      }
    }

    res.json({
      count: questionsToShow.length,
      questions: questionsToShow,
    });
  } catch (error) {
    console.error("Error getting questions to show:", error);
    next(error);
  }
});

module.exports = router;

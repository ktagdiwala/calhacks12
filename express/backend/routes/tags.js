const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

/* GET all tags */
router.get("/", async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    next(error);
  }
});

/* GET all tags for a specific userId */
router.get("/user/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        quizQuestions: true,
        flashcards: true,
      },
    });

    res.json(tags);
  } catch (error) {
    next(error);
  }
});

/* POST new tag */
router.post("/", async (req, res, next) => {
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
      return res.status(400).json({ error: "Tag already exists" });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        description: description || null,
        userId,
      },
      include: {
        quizQuestions: true,
        flashcards: true,
      },
    });

    res.status(201).json({
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Tag name already exists" });
    }
    next(error);
  }
});

module.exports = router;

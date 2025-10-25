var express = require("express");
var router = express.Router();
const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");

/* Health check endpoint */
router.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

/* GET all users */
router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        logs: true,
        userInputs: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/* GET user by ID */
router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        logs: true,
        userInputs: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/* CREATE a new user */
router.post("/users", async (req, res, next) => {
  try {
    const { email, username, authId } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        username,
        authId,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

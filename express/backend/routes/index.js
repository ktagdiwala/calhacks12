var express = require("express");
var router = express.Router();
const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const { authenticateUser } = require("../middleware/auth");

/* Health check endpoint - PUBLIC */
router.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

/* SIGN UP - PUBLIC */
router.post("/auth/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0], // Use email prefix as username
        password: "supabase_managed", // Password is managed by Supabase Auth
        authId: authData.user.id,
      },
    });

    res.status(201).json({
      message: "User created successfully. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      session: authData.session,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    next(error);
  }
});

/* SIGN IN - PUBLIC */
router.post("/auth/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { authId: data.user.id },
      include: {
        logs: true,
        userInputs: true,
      },
    });

    res.json({
      message: "Signed in successfully",
      session: data.session,
      user,
    });
  } catch (error) {
    next(error);
  }
});

/* SIGN OUT - PROTECTED */
router.post("/auth/signout", authenticateUser, async (req, res, next) => {
  try {
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
});

/* GET current authenticated user - PROTECTED */
router.get("/auth/me", authenticateUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { authId: req.user.id },
      include: {
        logs: true,
        userInputs: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/* GET all users - PROTECTED */
router.get("/users", authenticateUser, async (req, res, next) => {
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

/* GET user by ID - PROTECTED */
router.get("/users/:id", authenticateUser, async (req, res, next) => {
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

/* CREATE a new user - PROTECTED */
router.post("/users", authenticateUser, async (req, res, next) => {
  try {
    const { email, username, authId } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: "supabase_managed",
        authId,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

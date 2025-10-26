var express = require("express");
var router = express.Router();
const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const { authenticateUser } = require("../middleware/auth");

/* Health check endpoint - PUBLIC */
router.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

/* SIGN UP - PUBLIC - DEMO MODE */
router.post("/auth/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // DEMO MODE: Create user directly in database
    // No Supabase Auth required for demo
    const user = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0], // Use email prefix as username
        password: password || "demo_password", // Use provided password or default
        authId: `demo_${email}`, // Generate a fake authId
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    next(error);
  }
});

/* SIGN IN - PUBLIC - DEMO MODE: ANY VALID EMAIL */
router.post("/auth/signin", async (req, res, next) => {
  try {
    console.log("POST /auth/signin - Request body:", req.body);
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }


    const user = await prisma.user
      .findUnique({
        where: { email: email },
      })
      .catch((err) => {
        console.error("Database query error:", err);
        throw err;
      });

    if (!user) {
      return res
        .status(401)
        .json({ error: "User not found. Please sign up first." });
    }

    // DEMO MODE: Skip password validation, just return the user
    // In production, validate password against Supabase
    return res.json({
      message: "Signed in successfully",
      session: null, // No real session in demo mode
      user,
    });
  } catch (error) {
    console.error("Full error:", error);
    next(error);
  }
}); /* SIGN OUT - PROTECTED */
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

import express from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { authId: req.user!.id },
      include: { logs: true, userInputs: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

router.post("/create", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { username } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        email: req.user!.email,
        username,
        authId: req.user!.id,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error creating user", details: err });
  }
});

export default router;

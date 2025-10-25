import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabaseClient";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = {
    id: data.user.id,
    email: data.user.email!,
  };

  next();
}

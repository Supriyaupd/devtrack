import type { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/authService.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const user = await registerUser(name, email, password);

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(400).json({
        message: error.message,
      });
    }

    next(error);
  }
};
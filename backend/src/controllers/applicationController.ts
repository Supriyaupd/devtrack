import type { Request, Response } from "express";
import { getAllApplications } from "../services/applicationService.js";

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await getAllApplications();

    res.status(200).json({
      data: applications
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch applications"
    });
  }
};
import type { Request, Response } from "express";
import {
  getAllApplications,
  createApplication
} from "../services/applicationService.js";

export const getApplications = async (req: Request, res: Response) => {
  const applications = await getAllApplications();

  res.status(200).json({
    data: applications
  });
};

export const createApplicationHandler = async (
  req: Request,
  res: Response
) => {
  const { company, position, status, userId } = req.body;

  if (!company || !position || !status || !userId) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  const application = await createApplication(
    company,
    position,
    status,
    userId
  );

  res.status(201).json({
    message: "Application created",
    data: application
  });
};
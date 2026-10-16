import type { Request, Response } from "express";
import {
  getAllApplications,
  createApplication
} from "../services/applicationService.js";

export const getApplications = async (req: Request, res: Response) => {
  const applications = await getAllApplications(req.userId!);

  res.status(200).json({
    data: applications
  });
};

export const createApplicationHandler = async (
  req: Request,
  res: Response
) => {
  const { company, position, status } = req.body;

  if (
    typeof company !== "string" ||
    typeof position !== "string" ||
    typeof status !== "string" ||
    !company.trim() ||
    !position.trim() ||
    !status.trim()
  ) {
    return res.status(400).json({
      message: "Company, position and status are required"
    });
  }
  const application = await createApplication(
    company,
    position,
    status,
    req.userId!
  );

  res.status(201).json({
    message: "Application created",
    data: application
  });
}; 
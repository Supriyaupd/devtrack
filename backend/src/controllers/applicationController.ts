import type { Request, Response } from "express";
import {
  getAllApplications,
  createApplication,
  updateApplication
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


export const updateApplicationHandler = async (
  req: Request,
  res: Response
) => {
  const { company, position, status } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid application ID"
    });
  }

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

  const application = await updateApplication(
    id,
    company.trim(),
    position.trim(),
    status.trim(),
    req.userId!
  );

  if (!application) {
    return res.status(404).json({
      message: "Application not found"
    });
  }

  res.status(200).json({
    message: "Application updated",
    data: application
  });
};

import { Router } from "express";
import {
  getApplications,
  createApplicationHandler
} from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, createApplicationHandler);

export default router;
import { Router } from "express";
import {
  getApplications,
  createApplicationHandler
} from "../controllers/applicationController.js";

const router = Router();

router.get("/", getApplications);
router.post("/", createApplicationHandler);

export default router;
import { Router } from "express";
import {
  getApplications,
  createApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler
} from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, createApplicationHandler);
router.put("/:id", authMiddleware, updateApplicationHandler);
router.delete("/:id", authMiddleware, deleteApplicationHandler);

export default router;
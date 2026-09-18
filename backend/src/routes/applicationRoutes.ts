import { Router } from "express";
import { getApplications } from "../controllers/applicationController.js";

const router = Router();

router.get("/", getApplications);

export default router;
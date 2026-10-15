import express from "express";
import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(logger);
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("DevTrack API is running");
});

app.get("/api/health", (req, res) => {
  res.send("DevTrack API is healthy");
});

app.use(errorHandler);

export default app;
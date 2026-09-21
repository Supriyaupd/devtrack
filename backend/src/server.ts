import "dotenv/config";
import express from "express";
import pool from "./db/db.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(logger);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
    res.send("DevTrack API is running");
});

app.get("/api/health", (req, res) => {
    res.send("DevTrack API is healthy");
});

app.use(errorHandler);

pool.query("SELECT NOW()")
  .then((result) => {
    console.log("Database connected:", result.rows[0]);
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

app.listen(process.env.PORT, () => {
    console.log("DevTrack API is running on port 3000");
});
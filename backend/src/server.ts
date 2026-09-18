import "dotenv/config";
import express from "express";
import pool from "./db/db.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
    res.send("DevTrack API is running");
});

app.get("/api/health", (req, res) => {
    res.send("DevTrack API is healthy");
});

app.post("/api/applications", async (req, res) => {
  try {
    const { company, position, status, userId } = req.body;

    if (!company || !position || !status || !userId) {
  return res.status(400).json({
    message: "Missing required fields"
  });
}

    const result = await pool.query(
      `INSERT INTO applications
       (company, position, status, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [company, position, status, userId]
    );

    res.status(201).json({
      message: "Application created",
      data: result.rows[0]
    });
  } catch (error) {
  console.error(error);
  res.status(500).json({
    message: "Failed to create application"
  });
}
});

app.get("/api/applications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications ORDER BY created_at DESC"
    );

    res.status(200).json({
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch applications"
    });
  }
});

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
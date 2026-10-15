import "dotenv/config";
import pool from "./db/db.js";
import app from "./app.js";

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
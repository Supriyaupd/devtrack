import pool from "../db/db.js";

export const getAllApplications = async () => {
  const result = await pool.query(
    "SELECT * FROM applications ORDER BY created_at DESC"
  );

  return result.rows;
};
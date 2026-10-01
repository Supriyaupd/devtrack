import pool from "../db/db.js";

export const getAllApplications = async (userId: number) => {
  const result = await pool.query(
    "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  return result.rows;
};

export const createApplication = async (
  company: string,
  position: string,
  status: string,
  userId: number
) => {
  const result = await pool.query(
    `INSERT INTO applications
     (company, position, status, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [company, position, status, userId]
  );

  return result.rows[0];
};

import pool from "../db/db.js";
import bcrypt from "bcrypt";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const result = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertResult = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, hashedPassword]
  );

  return insertResult.rows[0];
};
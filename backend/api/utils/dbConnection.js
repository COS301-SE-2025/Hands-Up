import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

export const pool = new Pool({
  host: 'localhost',
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});


















import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

// Create a new pool instance to manage connections to the PostgreSQL database
console.log({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
});

export const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});


















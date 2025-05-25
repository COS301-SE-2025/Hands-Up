import pkg from 'pg';
const { Pool } = pkg;

// Create a new pool instance to manage connections to the PostgreSQL database
export const pool = new Pool({
  user: 'tmkdt',
  host: 'localhost',
  database: 'HandsUp',
  password: 'handsUpProject1.0',
  port: 5432,
});
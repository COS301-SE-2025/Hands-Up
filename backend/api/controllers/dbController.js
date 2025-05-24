import { Router } from 'express';
import { pool } from '../utils.js';
import bcrypt from 'bcrypt';

const router = Router();

export const learningProgress = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      'SELECT * FROM users',
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

// New signup function
export const signUpUser = async (req, res) => {
  try {
    const { name, surname, username, email, password } = req.body;

    // Validate input
    if (!name || !surname || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (username, name, surname, email, password) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING userid, username, email`,
      [username, name, surname, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Signup error:', err);
    
    // Handle unique constraint violations
    if (err.code === '23505') {
      const field = err.constraint.includes('username') ? 'username' : 'email';
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};



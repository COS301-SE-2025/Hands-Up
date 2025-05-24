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


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 1. Find user by email
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    
    // 2. Compare passwords (plaintext for now - we'll add hashing later)

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 3. Successful login
    res.status(200).json({
      success: true,
      user: {
        id: user.userid,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT userid, username, name, surname, email FROM users WHERE userid = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export default router;
// controllers/dbController.js
import { Router } from 'express';
import { pool } from '../utils.js'; // Assuming utils.js is in the parent directory
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const activeSessions = new Map();

export const learningProgress = async (req, res) => {
  const username = req.params.username;

  if (req.method === 'GET') {
    try {
      if (!username) {
        return res.status(400).json({
          status: "error",
          message: 'Username is required',
        });
      }

      const result = await pool.query(
        `SELECT "lessonsCompleted", "signsLearned", streak, "currentLevel" FROM learn JOIN users ON learn."userID"= users."userID" WHERE users.username = $1`,
        [username]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          status: "error",
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: "success",
        message: 'Learning progress retrieved successfully',
        data: result.rows,
      });

    } catch (err) {
      console.error('DB error:', err);
      res.status(500).json({
        status: "error",
        message: 'Internal Server Error',
      });
    }
  } else if (req.method === 'PUT') {
    if (req.user && req.user.username !== req.params.username) {
        return res.status(403).json({
            status: "error",
            message: 'Forbidden: You can only update your own progress.',
        });
    }

    try {
      const progressData = req.body;

      if (!username || !progressData) {
        return res.status(400).json({
          status: "error",
          message: 'Username and progress data are required',
        });
      }

      const result = await pool.query(
        `UPDATE learn SET "lessonsCompleted" = $1, "signsLearned" = $2, streak = $3
          FROM users WHERE learn."userID" = users."userID" AND users.username = $4`,
        [
          progressData.lessonsCompleted,
          progressData.signsLearned,
          progressData.streak,
          username
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          status: "error",
          message: 'User not found or no progress updated',
        });
      }

      res.status(200).json({
        status: "success",
        message: 'Learning progress updated successfully',
      });

    } catch (err) {
      console.error('DB error:', err);
      res.status(500).json({
        status: "error",
        message: 'Internal Server Error',
      });
    }
  }
};

export const signUpUser = async (req, res) => {
  try {
    const { name, surname, username, email, password } = req.body;

    if (!name || !surname || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query('BEGIN');

    const userResult = await pool.query(
      `INSERT INTO users (username, name, surname, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING "userID", username, email`,
      [username, name, surname, email, hashedPassword]
    );

    const userID = userResult.rows[0].userID;
    await pool.query(
      `INSERT INTO learn ("userID", "lessonsCompleted", "signsLearned", "streak", "currentLevel")
       VALUES ($1, $2, $3, $4, $5)`,
      [userID, 0, 0, 0, 'Bronze']
    );

    await pool.query('COMMIT');

    res.status(200).json({
      success: true,
      user: {
        id: userID,
        email: email,
        username: username
      },
      message: 'User registered successfully'
    });

  } catch (err) {
    console.error('Signup error:', err);
    await pool.query('ROLLBACK');

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

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`[BACKEND - LOGIN] User not found for email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[BACKEND - LOGIN] Incorrect password for user: ${user.username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiration = Date.now() + (1000 * 60 * 60 * 24); // 24 hours
    activeSessions.set(sessionId, {
        userId: user.userID,
        username: user.username,
        email: user.email,
        expires: sessionExpiration
    });

   

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true only if using HTTPS
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });

    res.status(200).json({
      success: true,
      user: {
        id: user.userID,
        email: user.email,
        username: user.username
      },
      message: 'Login successful'
    });

  } catch (err) {
    console.error('[BACKEND - LOGIN] Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logoutUser = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    activeSessions.delete(sessionId);
    console.log(`[BACKEND - LOGOUT] Session ID ${sessionId} removed from activeSessions.`);
  }

  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
  });

  console.log('[BACKEND - LOGOUT] User logged out successfully.');
  res.status(200).json({ message: 'Logged out successfully' });
};


export const authenticateUser = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  try {
    const sessionData = activeSessions.get(sessionId);
  
    if (!sessionData) {
   res.clearCookie('sessionId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/' });
      return res.status(401).json({ message: 'Unauthorized: Session invalid or expired.' });
    }

    if (Date.now() > sessionData.expires) {
    activeSessions.delete(sessionId);
      res.clearCookie('sessionId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/' });
      return res.status(401).json({ message: 'Unauthorized: Session invalid or expired.' });
    }

   sessionData.expires = Date.now() + (1000 * 60 * 60 * 24); // Extend by 24 hours
    activeSessions.set(sessionId, sessionData);
 
    const userResult = await pool.query(
      'SELECT "userID", username, name, surname, email FROM users WHERE "userID" = $1',
      [sessionData.userId]
    );
    const user = userResult.rows[0];

    if (!user) {
     activeSessions.delete(sessionId);
      res.clearCookie('sessionId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/' });
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }

    req.user = {
      id: user.userID,
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
    };
    next();

  } catch (error) {
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};


export const getUserData = async (req, res) => {
  if (req.user) {
    console.log(`[BACKEND - GET_USER_DATA] User data retrieved for: ${req.user.username}`);
   return res.status(200).json({
      user: req.user,
      message: 'User data retrieved successfully.'
    });
  } else {
    console.log('[BACKEND - GET_USER_DATA] User not authenticated for getUserData.');
   res.status(401).json({ message: 'User not authenticated.' });
  }
};


export const uniqueUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );

    res.status(200).json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uniqueEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );

    res.status(200).json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserDetails = async (req, res) => {
   if (!req.user || req.user.id !== parseInt(req.params.id)) {
     return res.status(403).json({ error: 'Forbidden: You can only update your own details.' });
   }

  try {
    const { id } = req.params;
    const { name, surname, username, email } = req.body;

    const query =
      `UPDATE users
       SET name = $1, surname = $2, username = $3, email = $4
       WHERE "userID" = $5
       RETURNING "userID", username, name, surname, email`;

    const values = [name, surname, username, email, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully.', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user details:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateUserPassword = async (req, res) => {
  if (!req.user || req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Forbidden: You can only update your own password.' });
  }

  try {
    const { id } = req.params;
    const { password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query =
      `UPDATE users SET password = $1 WHERE "userID" = $2 RETURNING "userID", username, name, surname, email`;
    const values = [hashedPassword, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User password updated successfully.', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user password:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
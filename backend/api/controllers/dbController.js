import { pool } from '../utils/dbConnection.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import multer from 'multer';

const activeSessions = new Map();
const resetTokens = new Map();
const MAX_LOGIN_ATTEMPTS = 4;
const LOCKOUT_DURATION_MINUTES = 2; 
const LOCKOUT_DURATION_MS = LOCKOUT_DURATION_MINUTES * 60 * 1000;

const loginAttempts = new Map();


const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const learningProgress = async (req, res) => {
    const username = req.params.username;

    if (req.method === 'GET') {
        try {
            if (!username) {
                return res.status(400).json({ status: "error", message: 'Username is required' });
            }
            const result = await pool.query(
                `SELECT "lessonsCompleted", "signsLearned", streak, "currentLevel"
                 FROM learn
                 JOIN users ON learn."userID"= users."userID"
                 WHERE users.username = $1`,
                [username]
            );

            if (result.rowCount === 0) {
                return res.status(200).json({ status: "success", message: 'No learning progress found for this user.', data: [] });
            }

            res.status(200).json({
                status: "success",
                message: 'Learning progress retrieved successfully',
                data: result.rows,
            });

        } catch (err) {
            console.error('DB GET error (learningProgress):', err);
            res.status(500).json({ status: "error", message: 'Internal Server Error' });
        }
    } else if (req.method === 'PUT') {
        if (!req.user || req.user.username !== req.params.username) {
            console.warn(`Unauthorized attempt to update progress for ${req.params.username} by user ${req.user ? req.user.username : 'N/A'}`);
            return res.status(403).json({ status: "error", message: 'Forbidden: You can only update your own progress.' });
        }
       

        try {
            const progressData = req.body;
            console.log("Backend received progressData for update:", progressData); // Debugging line

            if (!username || !progressData) {
                return res.status(400).json({ status: "error", message: 'Username and progress data are required' });
            }
       const {
                lessonsCompleted = 0,
                signsLearned = 0,
                streak = 0,
                currentLevel = 'Bronze' 
            } = progressData;

            if (typeof lessonsCompleted !== 'number' || typeof signsLearned !== 'number' || typeof streak !== 'number') {
                return res.status(400).json({ status: "error", message: 'lessonsCompleted, signsLearned, and streak must be numbers.' });
            }
           
            const result = await pool.query(
                `UPDATE learn SET
                    "lessonsCompleted" = $1,
                    "signsLearned" = $2,
                    streak = $3,
                    "currentLevel" = $4
                FROM users
                WHERE learn."userID" = users."userID" AND users.username = $5`,
                [
                    lessonsCompleted,
                    signsLearned,
                    streak,
                    currentLevel,
                    username
                ]
            );

            if (result.rowCount === 0) {
               return res.status(404).json({ status: "error", message: 'User learning record not found or no changes applied.' });
            }

            res.status(200).json({ status: "success", message: 'Learning progress updated successfully' });

        } catch (err) {
            console.error('DB PUT error (learningProgress):', err);
            res.status(500).json({ status: "error", message: 'Internal Server Error' });
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

    let loginData = loginAttempts.get(email);
    if (!loginData) {
        loginData = { attempts: 0, lockoutUntil: null, lastAttemptTime: Date.now() };
        loginAttempts.set(email, loginData);
    }

    if (loginData.lockoutUntil && Date.now() < loginData.lockoutUntil) {
        const remainingSeconds = Math.ceil((loginData.lockoutUntil - Date.now()) / 1000);
        console.log(`[BACKEND - LOGIN] Login attempt for ${email} blocked due to lockout. Remaining: ${remainingSeconds}s`);
        return res.status(401).json({
            message: `Too many failed login attempts. Please try again after ${remainingSeconds} seconds.`
        });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`[BACKEND - LOGIN] User not found for email: ${email}`);
     
      return res.status(401).json({ message: `Invalid email or password. ` });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[BACKEND - LOGIN] Incorrect password for user: ${user.username}`);
      loginData.attempts++;
      loginData.lastAttemptTime = Date.now(); 
      if (loginData.attempts >= MAX_LOGIN_ATTEMPTS) {
          loginData.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
          console.warn(`[BACKEND - LOGIN] Lockout initiated for ${email} due to ${loginData.attempts} failed attempts.`);
          return res.status(401).json({ message: `Too many failed login attempts. Please try again after ${LOCKOUT_DURATION_MINUTES} minutes.` });
      }
      loginAttempts.set(email, loginData); 
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginData.attempts;
      return res.status(401).json({ message: `Incorrect password. ${attemptsLeft} attempts left.` });
    }

    loginAttempts.delete(email);
    console.log(`[BACKEND - LOGIN] Login successful, login attempts cleared for ${email}`);

    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiration = Date.now() + (1000 * 60 * 60 * 24);
    activeSessions.set(sessionId, {
        userId: user.userID,
        username: user.username,
        email: user.email,
        expires: sessionExpiration
    });

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
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
    res.status(500).json({ message: 'Internal server error' });
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
    secure: true,
    sameSite: 'none',
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
   res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
      return res.status(401).json({ message: 'Unauthorized: Session invalid or expired.' });
    }

    if (Date.now() > sessionData.expires) {
    activeSessions.delete(sessionId);
      res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
      return res.status(401).json({ message: 'Unauthorized: Session invalid or expired.' });
    }

   sessionData.expires = Date.now() + (1000 * 60 * 60 * 24);
    activeSessions.set(sessionId, sessionData);
  
    const userResult = await pool.query(
      'SELECT "userID", username, name, surname, email, avatarurl FROM users WHERE "userID" = $1',
      [sessionData.userId]
    );
    const user = userResult.rows[0];

    if (!user) {
     activeSessions.delete(sessionId);
      res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }

    req.user = {
      id: user.userID,
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
      avatarurl: user.avatarurl,
    };
    next();

  } catch (error) {
    res.status(500).json({ message: 'Internal server error during authentication.' + error });
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


export const deleteUserAccount = async (req, res) => {
  const { id } = req.params;
  const userIDToDelete = parseInt(id, 10);
  
  if (isNaN(userIDToDelete)) {
    return res.status(400).json({ message: 'Invalid User ID provided.' });}
    
  if (!req.user || req.user.id !== userIDToDelete) {
    return res.status(403).json({ message: 'Forbidden: You can only delete your own account.' });}
    
    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const deleteLearnResult = await client.query(
        `DELETE FROM learn WHERE "userID" = $1`,
        [userIDToDelete]
      );
      
      console.log(`[BACKEND - DELETE_USER] Deleted ${deleteLearnResult.rowCount} learning progress records for user ${userIDToDelete}.`);

      const deleteUserResult = await client.query(
        
        `DELETE FROM users WHERE "userID" = $1 RETURNING "userID", username`,
          [userIDToDelete] );
          
          if (deleteUserResult.rows.length === 0)
          {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: 'User not found.' });}


           await client.query('COMMIT');
          //  let sessionDeleted = false;
           
           for (const [sessionId, sessionData] of activeSessions.entries()) {
           
            if (sessionData.userId === userIDToDelete) {
              activeSessions.delete(sessionId);
              console.log(`[BACKEND - DELETE_USER] Session ID ${sessionId} removed for deleted user.`);

              if (req.cookies.sessionId === sessionId) {
                  res.clearCookie('sessionId',
                  {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'none',
                    path: '/',});
                    // sessionDeleted = true;
                    }}}

console.log(`[BACKEND - DELETE_USER] User account '${deleteUserResult.rows[0].username}' (ID: ${userIDToDelete}) and associated data deleted successfully.`);

res.status(200).json({ message: 'User account deleted successfully.' });



} catch (err) {
  if (client) {
  await client.query('ROLLBACK');
}

console.error('Error deleting user account:', err);

res.status(500).json({ message: 'Internal server error during account deletion.', error: err.message });
} finally {

  if (client) {client.release(); }
 }

};

export const resetPassword = async (req, res) => {
  console.log("[BACKEND - RESET_PASSWORD] Password reset request received");
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const userResult = await pool.query(
      'SELECT "userID", username, email, name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = userResult.rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + (1000 * 60 * 15); 

    resetTokens.set(resetToken, {
      userId: user.userID,
      email: user.email,
      expires: tokenExpiration
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}?email=${user.email}`;
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request - HandsUP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to reset your password for your HandsUP account.</p>
          <p>Click the link below to reset your password:</p>
          <p>
            <a href="${resetUrl}"
              style="background-color: #007bff; color: white; padding: 10px 20px;
                     text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The HandsUP Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`[BACKEND - RESET_PASSWORD] Password reset email sent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('[BACKEND - RESET_PASSWORD] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

export const confirmPasswordReset = async (req, res) => {
  console.log("[BACKEND - CONFIRM_RESET] Password reset confirmation request received");
  
  try {
    const { email,token, newPassword, confirmationPassword } = req.body;

      if (!email || !token || !newPassword || !confirmationPassword) {
        console.error("Missing required fields in backend:", { email, token, newPassword, confirmationPassword });
        return res.status(400).json({ message: 'Token, new password, and confirmation password are required' });
    
    }

    if (newPassword !== confirmationPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE "userID" = $2 RETURNING "userID", username, email',
      [hashedPassword, tokenData.userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    resetTokens.delete(token);
    for (const [sessionId, sessionData] of activeSessions.entries()) {
      if (sessionData.userId === tokenData.userId) {
        activeSessions.delete(sessionId);
        console.log(`[BACKEND - CONFIRM_RESET] Session ${sessionId} invalidated for user ${tokenData.userId}`);
      }
    }

    console.log(`[BACKEND - CONFIRM_RESET] Password reset successful for user: ${updateResult.rows[0].username}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('[BACKEND - CONFIRM_RESET] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expires) {
      resetTokens.delete(token);
      console.log(`[BACKEND - CLEANUP] Expired reset token cleaned up: ${token}`);
    }
  }
}, 1000 * 60 * 5); 

setInterval(() => {
    const now = Date.now();
    for (const [email, data] of loginAttempts.entries()) {
        if (data.lockoutUntil && now > data.lockoutUntil) {
            loginAttempts.delete(email);
            console.log(`[BACKEND - CLEANUP] Expired lockout for ${email} cleaned up.`);
        }
    
        else if (!data.lockoutUntil && (now - data.lastAttemptTime > LOCKOUT_DURATION_MS * 5)) {
            loginAttempts.delete(email);
            console.log(`[BACKEND - CLEANUP] Stale login attempts for ${email} cleared.`);
        }
    }
}, 1000 * 30);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});


export const uploadUserAvatar = async (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ status: "error", message: err.message });
      } else if (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }
    }

    if (!req.file) {
      return res.status(400).json({ status: "error", message: 'No file uploaded.' });
    }

    if (!req.user || req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ error: 'Forbidden: You can only upload an avatar for your own account.' });
    }

    const userID = parseInt(req.params.id);
    const avatarPath = req.file.path.replace(/\\/g, '/'); 
    try {
      const result = await pool.query(
        `UPDATE users SET "avatarurl" = $1 WHERE "userID" = $2 RETURNING "userID", username, "avatarurl"`,
        [avatarPath, userID]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ status: "error", message: 'User not found.' });
      }

      res.status(200).json({
        status: "success",
        message: 'Avatar uploaded successfully',
        data: {
          userID: result.rows[0].userID,
          username: result.rows[0].username,
          avatarurl: result.rows[0].avatarurl,
        },
      });

    } catch (dbError) {
      console.error('DB error uploading avatar:', dbError);
      res.status(500).json({ status: "error", message: 'Internal Server Error' });
    }
  });
};
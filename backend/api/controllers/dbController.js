import { pool } from '../utils/dbConnection.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import path from 'path'; 
import fs from 'fs/promises';
import { sendRegistrationEmail } from './emailService.js';

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

            const detailedResult = await pool.query(
                `SELECT 
                    "learnedSigns", 
                    "learnedPhrases", 
                    "unlockedCategories", 
                    "placementTestCompleted", 
                    "placementResults",
                    "quizzesCompleted",
                    "alphabetsQuizCompleted",
                    "numbersQuizCompleted",
                    "introduceQuizCompleted",
                    "coloursQuizCompleted",
                    "familyQuizCompleted",
                    "feelingsQuizCompleted",
                    "actionsQuizCompleted",
                    "questionsQuizCompleted",
                    "timeQuizCompleted",
                    "foodQuizCompleted",
                    "thingsQuizCompleted",
                    "animalsQuizCompleted",
                    "seasonsQuizCompleted",
                    "phrasesQuizCompleted",
                    "hasSeenWelcome",
                    "hasSeenCategoryHelp"
                 FROM learn_details
                 JOIN users ON learn_details."userID" = users."userID"
                 WHERE users.username = $1`,
                [username]
            );

            if (result.rowCount === 0) {
                return res.status(200).json({ status: "success", message: 'No learning progress found for this user.', data: [] });
            }

            const basicData = result.rows[0];
            const detailedData = detailedResult.rows[0] || {};
            const learnedSigns = detailedData.learnedSigns ? JSON.parse(detailedData.learnedSigns) : [];
            const learnedPhrases = detailedData.learnedPhrases ? JSON.parse(detailedData.learnedPhrases) : [];
            const unlockedCategories = detailedData.unlockedCategories ? JSON.parse(detailedData.unlockedCategories) : ['alphabets'];
            const placementResults = detailedData.placementResults ? JSON.parse(detailedData.placementResults) : null;
            const hasSeenCategoryHelp = detailedData.hasSeenCategoryHelp ? JSON.parse(detailedData.hasSeenCategoryHelp) : {};

            const isNewUser = (basicData.lessonsCompleted || 0) === 0 && 
                            (basicData.signsLearned || 0) === 0 && 
                            learnedSigns.length === 0;

            console.log(`=== USER PROGRESS CHECK FOR ${username} ===`);
            console.log('lessonsCompleted:', basicData.lessonsCompleted);
            console.log('signsLearned:', basicData.signsLearned);
            console.log('learnedSigns array length:', learnedSigns.length);
            console.log('isNewUser:', isNewUser);
            console.log('hasSeenWelcome:', detailedData.hasSeenWelcome);
            console.log('placementTestCompleted:', detailedData.placementTestCompleted);

            const mergedData = {
                ...basicData,
                ...detailedData,
                learnedSigns,
                learnedPhrases,
                unlockedCategories,
                placementResults,
                hasSeenCategoryHelp,
                signsLearned: learnedSigns.length,
                isNewUser 
            };

            res.status(200).json({
                status: "success",
                message: 'Learning progress retrieved successfully',
                data: [mergedData],
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
            console.log("Backend received progressData for update:", progressData);

            if (!username || !progressData) {
                return res.status(400).json({ status: "error", message: 'Username and progress data are required' });
            }
            const {
                lessonsCompleted = 0,
                streak = 0,
                currentLevel = 'Bronze',
                learnedSigns = [],
                learnedPhrases = [],
                unlockedCategories = ['alphabets'],
                placementTestCompleted = false,
                placementResults = null,
                quizzesCompleted = 0,
                alphabetsQuizCompleted = false,
                numbersQuizCompleted = false,
                introduceQuizCompleted = false,
                coloursQuizCompleted = false,
                familyQuizCompleted = false,
                feelingsQuizCompleted = false,
                actionsQuizCompleted = false,
                questionsQuizCompleted = false,
                timeQuizCompleted = false,
                foodQuizCompleted = false,
                thingsQuizCompleted = false,
                animalsQuizCompleted = false,
                seasonsQuizCompleted = false,
                phrasesQuizCompleted = false,
                hasSeenWelcome = false,
                hasSeenCategoryHelp = {}
            } = progressData;

            const signsLearned = Array.isArray(learnedSigns) ? learnedSigns.length : 0;

            if (typeof lessonsCompleted !== 'number' || typeof streak !== 'number') {
                return res.status(400).json({ status: "error", message: 'lessonsCompleted and streak must be numbers.' });
            }
            
            await pool.query('BEGIN');
         
            const basicResult = await pool.query(
                `UPDATE learn SET
                    "lessonsCompleted" = $1,
                    "signsLearned" = $2,
                    streak = $3,
                    "currentLevel" = $4
                 FROM users
                 WHERE learn."userID" = users."userID" AND users.username = $5
                 RETURNING learn."userID"`,
                [lessonsCompleted, signsLearned, streak, currentLevel, username]
            );

            if (basicResult.rowCount === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ status: "error", message: 'User learning record not found.' });
            }

            const userID = basicResult.rows[0].userID;

         await pool.query(
                `INSERT INTO learn_details (
                    "userID", "learnedSigns", "learnedPhrases", "unlockedCategories", 
                    "placementTestCompleted", "placementResults", "quizzesCompleted",
                    "alphabetsQuizCompleted", "numbersQuizCompleted", "introduceQuizCompleted",
                    "coloursQuizCompleted", "familyQuizCompleted", "feelingsQuizCompleted",
                    "actionsQuizCompleted", "questionsQuizCompleted", "timeQuizCompleted",
                    "foodQuizCompleted", "thingsQuizCompleted", "animalsQuizCompleted",
                    "seasonsQuizCompleted", "phrasesQuizCompleted", "hasSeenWelcome", "hasSeenCategoryHelp"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                ON CONFLICT ("userID") DO UPDATE SET
                    "learnedSigns" = EXCLUDED."learnedSigns",
                    "learnedPhrases" = EXCLUDED."learnedPhrases",
                    "unlockedCategories" = EXCLUDED."unlockedCategories",
                    "placementTestCompleted" = EXCLUDED."placementTestCompleted",
                    "placementResults" = EXCLUDED."placementResults",
                    "quizzesCompleted" = EXCLUDED."quizzesCompleted",
                    "alphabetsQuizCompleted" = EXCLUDED."alphabetsQuizCompleted",
                    "numbersQuizCompleted" = EXCLUDED."numbersQuizCompleted",
                    "introduceQuizCompleted" = EXCLUDED."introduceQuizCompleted",
                    "coloursQuizCompleted" = EXCLUDED."coloursQuizCompleted",
                    "familyQuizCompleted" = EXCLUDED."familyQuizCompleted",
                    "feelingsQuizCompleted" = EXCLUDED."feelingsQuizCompleted",
                    "actionsQuizCompleted" = EXCLUDED."actionsQuizCompleted",
                    "questionsQuizCompleted" = EXCLUDED."questionsQuizCompleted",
                    "timeQuizCompleted" = EXCLUDED."timeQuizCompleted",
                    "foodQuizCompleted" = EXCLUDED."foodQuizCompleted",
                    "thingsQuizCompleted" = EXCLUDED."thingsQuizCompleted",
                    "animalsQuizCompleted" = EXCLUDED."animalsQuizCompleted",
                    "seasonsQuizCompleted" = EXCLUDED."seasonsQuizCompleted",
                    "phrasesQuizCompleted" = EXCLUDED."phrasesQuizCompleted",
                    "hasSeenWelcome" = EXCLUDED."hasSeenWelcome",
                    "hasSeenCategoryHelp" = EXCLUDED."hasSeenCategoryHelp"`,
                [
                    userID,
                    JSON.stringify(learnedSigns),
                    JSON.stringify(learnedPhrases),
                    JSON.stringify(unlockedCategories),
                    placementTestCompleted,
                    placementResults ? JSON.stringify(placementResults) : null,
                    quizzesCompleted,
                    alphabetsQuizCompleted,
                    numbersQuizCompleted,
                    introduceQuizCompleted,
                    coloursQuizCompleted,
                    familyQuizCompleted,
                    feelingsQuizCompleted,
                    actionsQuizCompleted,
                    questionsQuizCompleted,
                    timeQuizCompleted,
                    foodQuizCompleted,
                    thingsQuizCompleted,
                    animalsQuizCompleted,
                    seasonsQuizCompleted,
                    phrasesQuizCompleted,
                    hasSeenWelcome,
                    JSON.stringify(hasSeenCategoryHelp)
                ]
            );

            await pool.query('COMMIT');

            console.log(`Learning progress updated for ${username}. Signs learned: ${signsLearned} (from ${learnedSigns.length} signs in array)`);

            res.status(200).json({ 
                status: "success", 
                message: 'Learning progress updated successfully',
                data: {
                    signsLearned,
                    learnedSignsCount: learnedSigns.length
                }
            });

        } catch (err) {
            await pool.query('ROLLBACK');
            console.error('DB PUT error (learningProgress):', err);
            res.status(500).json({ status: "error", message: 'Internal Server Error' });
        }
    }
};


export const signUpUser = async (req, res) => {
    try {
        console.log("checkpoint1");

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
        console.log("checkpoint2");
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

        await pool.query(
            `INSERT INTO learn_details (
                "userID", "learnedSigns", "learnedPhrases", "unlockedCategories", 
                "placementTestCompleted", "quizzesCompleted"
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                userID, 
                JSON.stringify([]), 
                JSON.stringify([]), 
                JSON.stringify(['alphabets']), 
                false, 
                0
            ]
        );
        console.log("checkpoint3");
        await pool.query('COMMIT');

        // try {
        //     await sendRegistrationEmail(email, username);
        //     console.log(`Registration email sent to ${email}`);
        // } catch (emailErr) {
        //     console.error('Failed to send registration email:', emailErr);
        //     // Don't return an error here; the user is already registered
        // }
        try {
            sendRegistrationEmail(email, username) // Removed 'await'
                .then(() => console.log(`Registration email sent to ${email}`))
                .catch(emailErr => {
                    // Log the error, but the user still gets a success response.
                    console.error('Failed to send registration email in background:', emailErr);
                });
        } catch (emailErr) {
            // This catches immediate synchronous errors during function call setup.
            console.error('Error initiating email send:', emailErr);
        }
        console.log("checkpoint4");
        res.status(200).json({
            success: true,
            user: {
                id: userID,
                email: email,
                username: username
            },
            message: 'User registered successfully'
        });
        console.log("checkpoint5");
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
            
            return res.status(401).json({ error: `Invalid email or password. ` });
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
                return res.status(401).json({ error: `Too many failed login attempts. Please try again after ${LOCKOUT_DURATION_MINUTES} minutes.` });
            }
            loginAttempts.set(email, loginData); 
            const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginData.attempts;
            return res.status(401).json({ error: `Incorrect password. ${attemptsLeft} attempts left.` });
        }

        loginAttempts.delete(email);
        console.log(`[BACKEND - LOGIN] Login successful, login attempts cleared for ${email}`);

        const sessionId = crypto.randomBytes(32).toString('hex');
        const sessionExpiration = Date.now() + (1000 * 60 * 60 * 24); // 24 hours
        activeSessions.set(sessionId, {
            userId: user.userID,
            username: user.username,
            email: user.email,
            expires: sessionExpiration
        });
        console.log("sessionId", sessionId);
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'none', 
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            path: '/',
        });

        res.header('Access-Control-Allow-Origin', 'https://handsup.onrender.com');
        res.header('Access-Control-Allow-Credentials', 'true');

        console.log("executed query");
        res.status(200).json({
            success: true,
            sessionId: sessionId,
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
        sameSite: 'none',
        path: '/',
    });

    console.log('[BACKEND - LOGOUT] User logged out successfully.');
    res.status(200).json({ message: 'Logged out successfully' });
};


// export const authenticateUser = async (req, res, next) => {
//     console.log('Raw Cookie Header:', req.headers.cookie);
//     const sessionId = req.cookies.sessionId;
//     console.log("sessionID in authUser", sessionId);

//     try {
//         const sessionData = activeSessions.get(sessionId);
    
//         if (!sessionData) {
//             res.clearCookie('sessionId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', path: '/' });
//             return res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
//         }

//         if (Date.now() > sessionData.expires) {
//             activeSessions.delete(sessionId);
//             res.clearCookie('sessionId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', path: '/' });
//             return res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
//         }

//         sessionData.expires = Date.now() + (1000 * 60 * 60 * 24); 
//         activeSessions.set(sessionId, sessionData);
    
//         const userResult = await pool.query(
//             'SELECT "userID", username, name, surname, email, avatarurl, createdat FROM users WHERE "userID" = $1',
//             [sessionData.userId]
//         );
//         const user = userResult.rows[0];

//         if (!user) {
//             activeSessions.delete(sessionId);
//             res.clearCookie('sessionId', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', path: '/' });
//             return res.status(401).json({ error: 'Unauthorized: User not found.' });
//         }

//         req.user = {
//             id: user.userID,
//             username: user.username,
//             email: user.email,
//             name: user.name,
//             surname: user.surname,
//             avatarurl: user.avatarurl,
//             createdAt: user.createdat
           
//         };
//         next();

//     } catch (error) {
//         console.error('Error during authentication:', error);
//         res.status(500).json({ message: 'Internal server error during authentication.' });
//     }
// };

// NOTE: You MUST ensure 'pool' (your database client) and 'activeSessions' 
// (your session Map) are correctly imported/accessible in this file.

// Example Imports (adjust path/file name as necessary):
// import { pool } from '../db/db.js'; 
// import { activeSessions } from '../sessions.js'; 

export const authenticateUser = async (req, res, next) => {
    // Log the incoming cookie header (will be 'undefined' if client isn't sending it)
    console.log('Raw Cookie Header:', req.headers.cookie);
    const sessionId = req.cookies.sessionId;
    console.log("sessionID in authUser", sessionId);

    // If the browser failed to send the cookie, we cannot authenticate
    if (!sessionId) {
        req.user = null;
        console.log('[BACKEND - AUTH] Session ID missing from request.');
        return next();
    }

    try {
        const sessionData = activeSessions.get(sessionId);
    
        // 1. Check if session exists in the server Map
        if (!sessionData) {
            // Clear client's bad cookie (using Safari fixes) and proceed as unauthenticated
            res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
            req.user = null;
            console.log('[AUTHenticate user] Session not found in Map. Cleared cookie.');
            return res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
        }

        // 2. Check if session has expired
        if (Date.now() > sessionData.expires) {
            activeSessions.delete(sessionId);
            // Clear client's expired cookie (using Safari fixes) and proceed as unauthenticated
            res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
            req.user = null;
            console.log('[AUTHenticate user] Session expired. Cleared cookie.');
            return res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
        }

        // 3. Refresh the session expiration time (sliding session)
        sessionData.expires = Date.now() + (1000 * 60 * 60 * 24); // 24 hours renewal
        activeSessions.set(sessionId, sessionData);
    
        // 4. Look up full user data from the database
        const userResult = await pool.query(
            'SELECT "userID", username, name, surname, email, avatarurl, createdat FROM users WHERE "userID" = $1',
            [sessionData.userId]
        );
        const user = userResult.rows[0];

        // 5. Check if user exists (in case the user was deleted)
        if (!user) {
            activeSessions.delete(sessionId);
            // Clear client's cookie for a non-existent user
            res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
            req.user = null;
            console.log('[AUTHenticate user] User associated with session not found. Cleared cookie.');
            return res.status(401).json({ error: 'Unauthorized: User not found.' });
        }

        // 6. Authentication SUCCESS: Attach user object to the request
        req.user = {
            id: user.userID,
            username: user.username,
            email: user.email,
            name: user.name,
            surname: user.surname,
            avatarurl: user.avatarurl,
            createdAt: user.createdat
        };
        console.log(`[AUTHenticate user] Successfully authenticated user: ${user.username}`);

        // 7. Proceed to the requested route
        next();

    } catch (error) {
        // Handle any database or general server errors during the authentication process
        console.error('Error during authentication:', error);
        req.user = null; // Ensure req.user is clean on error
        res.status(500).json({ message: 'Internal server error during authentication.' });
    }
};



export const getUserData = async (req, res) => {
     console.log("checkpoint 3");
    if (req.user) {
        console.log(`[BACKEND - GET_USER_DATA] User data retrieved for: ${req.user.username}`);
        return res.status(200).json({
            user: req.user,
            message: 'User data retrieved successfully.'
        });
    } else {
        console.log('[BACKEND - GET_USER_DATA] User not authenticated for getUserData.');
        res.status(401).json({ error: 'User not authenticated.' });
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


export const uploadUserAvatar = async (req, res) => {
    console.log('[dbController.js] uploadUserAvatar function entered.');
    console.log('req.file:', req.file); 

    if (!req.file) {
        console.error('[dbController.js] No file uploaded to uploadUserAvatar.');
        return res.status(400).json({ status: "error", message: 'No file uploaded.' });
    }

    if (!req.user || req.user.id !== parseInt(req.params.id)) {
        console.warn(`[dbController.js] Unauthorized avatar upload attempt for user ID ${req.params.id} by user ${req.user ? req.user.id : 'N/A'}`);
        return res.status(403).json({ error: 'Forbidden: You can only upload an avatar for your own account.' });
    }

    const userID = parseInt(req.params.id);
    const originalname = req.file.originalname;
    const buffer = req.file.buffer;
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    
    const filename = `${userID}-${Date.now()}-${originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`; 
    const filePath = path.join(uploadDir, filename);

    try {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log(`[dbController.js] Ensured directory exists: ${uploadDir}`);
        await fs.writeFile(filePath, buffer);
        console.log(`[dbController.js] Avatar saved to: ${filePath}`);
        const avatarUrl = `/uploads/avatars/${filename}`; 
        const result = await pool.query(
            `UPDATE users SET "avatarurl" = $1 WHERE "userID" = $2 RETURNING "userID", username, "avatarurl"`,
            [avatarUrl, userID]
        );
        console.log('[dbController.js] Database update result:', result.rows[0]);

        if (result.rows.length === 0) {
            console.warn(`[dbController.js] User with ID ${userID} not found in DB after file save. Attempting to delete file: ${filePath}`);
            await fs.unlink(filePath).catch(unlinkErr => console.error("Error deleting orphaned avatar file:", unlinkErr));
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

    } catch (error) {
        console.error('[dbController.js] Error in uploadUserAvatar:', error);
        if (filePath) {
            await fs.unlink(filePath).catch(unlinkErr => console.error("Error deleting partially saved avatar file during error:", unlinkErr));
        }
        res.status(500).json({ status: "error", message: 'Internal Server Error during avatar upload: ' + error.message });
    }
};

export const deleteUserAvatar = async (req, res) => {
    console.log('[dbController.js] deleteUserAvatar function entered.');
    const userID = parseInt(req.params.id);

    // 1. Authorization Check
    if (!req.user || req.user.id !== userID) {
        console.warn(`[dbController.js] Unauthorized avatar deletion attempt for user ID ${userID} by user ${req.user ? req.user.id : 'N/A'}`);
        return res.status(403).json({ error: 'Forbidden: You can only delete the avatar for your own account.' });
    }

    try {
        // Fetch the current avatar URL from the database
        const userResult = await pool.query('SELECT avatarurl FROM users WHERE "userID" = $1', [userID]);
        const currentAvatarUrl = userResult.rows[0]?.avatarurl;

        if (!currentAvatarUrl) {
            console.log(`[dbController.js] No avatar found to delete for user ID ${userID}.`);
            return res.status(200).json({ status: "success", message: 'No avatar found to delete.' });
        }
        
        // 2. Delete the physical file from the server
        const filePath = path.join(process.cwd(), currentAvatarUrl);
        if (await fs.stat(filePath).catch(() => false)) { // Check if file exists
            await fs.unlink(filePath);
            console.log(`[dbController.js] Old avatar file deleted: ${filePath}`);
        }

        // 3. Update the database to set avatarurl to NULL
        const result = await pool.query(
            `UPDATE users SET "avatarurl" = NULL WHERE "userID" = $1 RETURNING "userID", username, "avatarurl"`,
            [userID]
        );
        console.log('[dbController.js] Database updated to clear avatar URL:', result.rows[0]);

        // 4. Send success response
        res.status(200).json({
            status: "success",
            message: 'Avatar deleted successfully',
            data: {
                userID: result.rows[0].userID,
                username: result.rows[0].username,
                avatarurl: result.rows[0].avatarurl,
            },
        });

    } catch (error) {
        console.error('[dbController.js] Error in deleteUserAvatar:', error);
        res.status(500).json({ status: "error", message: 'Internal Server Error during avatar deletion: ' + error.message });
    }
};
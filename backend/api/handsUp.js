import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/apiRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js'
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// --- FIXED IMPORT ---
// Import the centralized activeSessions map from the new sessions.js file.
// NOTE: Make sure the path './sessions.js' is correct relative to handsUp.js
import { activeSessions } from './sessions.js'; 

dotenv.config();

const app = express();

app.use(cors({
    origin: ['https://handsup.onrender.com'],
    credentials: true, 
}));

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// --- 3. CUSTOM AUTHENTICATION MIDDLEWARE ---
// This function runs on every request to check the session cookie.
const authenticateUser = (req, res, next) => {
    console.log("i entered the handsup.js");
    const sessionId = req.cookies.sessionId;
    
    // 1. If no session ID, user is not logged in.
    if (!sessionId) {
        console.log("handsup.js no session id found");
        req.user = null;
        return next();
    }

    // 2. Look up the session in the activeSessions map (imported from sessions.js)
    const sessionData = activeSessions.get(sessionId);
    
    if (sessionData && sessionData.expires > Date.now()) {
        console.log("i entered session in handsup.js");
        // Session is valid and not expired. Attach user data to req.user
        req.user = { 
            id: sessionData.userId, 
            email: sessionData.email, 
            username: sessionData.username 
        };
        console.log(`[handsUp.js] Session valid for user: ${sessionData.username}`);
    } else {
        console.log("i enetered else condition in handsup.js");
        // Session expired or invalid. Clear the cookie.
        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none', 
            path: '/',
        });
        req.user = null;
        console.log('[handsUp.js] Session expired or invalid, cookie cleared.');
    }

    next();
};

// APPLY THE MIDDLEWARE GLOBALLY
app.use(authenticateUser);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. Security Headers ---
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.secure) { 
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// --- 5. Routes ---

// The /api/user route now relies on 'authenticateUser' having populated req.user
app.get('/api/user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    if (req.user) { 
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use('/handsUPApi', apiRoutes);
app.use('/handsUPApi/curriculum', curriculumRoutes); 

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
// import session from 'express-session'; // Removed unused module
import apiRoutes from './routes/apiRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js'
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// --- IMPORTANT: Adjust the path below to where your authenticateUser function is defined ---
// Example: If it's in a file named 'authController.js' in a 'controllers' folder next to this file:
import { authenticateUser } from './controllers/authController.js'; 
// If it's in your apiRoutes file, import it from there instead:
// import { authenticateUser } from './routes/apiRoutes.js'; 

dotenv.config();

const app = express();

// --- CORS Configuration (Essential for Safari Cookies) ---
app.use(cors({
    origin: ['https://handsup.onrender.com'],
    credentials: true, // MUST remain true for cross-site cookie handling
    // Ensure all necessary methods are allowed for the OPTIONS preflight request
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookieParser is essential for reading the sessionId cookie
app.use(cookieParser());


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Custom Security Headers (Enhanced for CORS) ---
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.secure) { 
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // **CRITICAL FOR SAFARI/ITP:** Explicitly confirms credentials are allowed 
    // for cross-site requests. This helps the browser accept the cookie.
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    next();
});

// --- APPLY AUTHENTICATION MIDDLEWARE GLOBALLY ---
// This runs on every request and populates req.user from the cookie.
app.use(authenticateUser);

app.get('/api/user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    // This relies entirely on the authenticateUser middleware running successfully.
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

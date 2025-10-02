import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/apiRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js'
import { authenticateUser } from './controllers/dbController.js'; // Adjust path as needed
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// --- 1. CORS Configuration (CRITICAL FOR SAFARI) ---
// This is the absolute minimum robust CORS config needed for cross-site cookies.
app.use(cors({
    // Explicitly allow your frontend domain
    origin: ['https://handsup.onrender.com'],
    // MUST BE TRUE to accept and send cookies/credentials
    credentials: true, 
    // Allow necessary methods for the preflight request
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // Allow necessary headers for the preflight request
    allowedHeaders: 'Content-Type,Authorization',
}));

// --- 2. Middleware Setup ---
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookieParser is essential to read the cookie sent from the client
app.use(cookieParser());


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. Security Headers ---
app.use((req, res, next) => {
    // Other security headers (S.T.S., X-Frame-Options, etc.)
    if (process.env.NODE_ENV === 'production' && req.secure) { 
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // **Explicitly allow credentials in OPTIONS response (CRITICAL for Safari)**
    // The cors middleware should do this, but manually setting it ensures it.
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    next();
});

// --- 4. Custom Authentication Middleware ---
// Applies the middleware to check req.cookies.sessionId on every request.
app.use(authenticateUser);

app.get('/api/user', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    // This now relies on authenticateUser having run successfully
    if (req.user) {
        res.json({ user: req.user });
    } else {
        // If authenticateUser failed, req.user is null, and we return 401
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

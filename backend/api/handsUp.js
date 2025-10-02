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

// --- FIXED IMPORT PATH ---
// Assuming authenticateUser is defined and exported from your apiRoutes file
import { authenticateUser } from './routes/apiRoutes.js'; 

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


// --- 3. APPLY AUTHENTICATION MIDDLEWARE ---
// This middleware runs on every request BEFORE it hits any route.
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
        // This works because the imported middleware ran first.
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

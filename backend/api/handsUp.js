import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import apiRoutes from './routes/apiRoutes.js';
import dotenv from 'dotenv';
import {dirname} from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors({
    origin: ['https://handsup.onrender.com'],
    credentials: true,           
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_strong_secret_key_for_sessions',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'none', 
    },
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.secure) { 
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});


app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use('/handsUPApi', apiRoutes);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

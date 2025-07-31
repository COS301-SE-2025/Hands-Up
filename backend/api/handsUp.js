import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import apiRoutes from './routes/apiRoutes.js';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = 2001; 
const HTTPS_PORT = 2000; 
app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    credentials: true,           
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_strong_secret_key_for_sessions', 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        secure: true, 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'lax', 
    },
   
}));

app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Health check endpoint (add before apiRoutes)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.use('/handsUPApi', apiRoutes);

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

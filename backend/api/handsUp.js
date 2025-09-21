import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import apiRoutes from './routes/apiRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js'
import dotenv from 'dotenv';
import http from 'http';
import path from 'path'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path'; 

dotenv.config();

const app = express();
const HTTP_PORT = 2000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_strong_secret_key_for_sessions',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
    },
}));


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
app.use('/handsUPApi/curriculum', curriculumRoutes); 

const httpServer = http.createServer(app);

httpServer.listen(HTTP_PORT, () => {
    console.log(`
        HTTP Server running on http://localhost:${HTTP_PORT}`);
    console.log(`API available at http://localhost:${HTTP_PORT}/handsUPApi`);
    console.log(`Type "shutdown" to stop the server.`);
});
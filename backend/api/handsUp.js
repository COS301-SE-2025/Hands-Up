import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import apiRoutes from './routes/apiRoutes.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const app = express();
const HTTP_PORT = 2000; 
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

app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.use('/handsUPApi', apiRoutes);
const httpServer = http.createServer(app);


httpServer.listen(HTTP_PORT, () => {
    console.log(`
        HTTP Server running on http://localhost:${HTTP_PORT}`);
    console.log(`API available at http://localhost:${HTTP_PORT}/handsUPApi`);
    console.log(`Type "shutdown" to stop the server.`);
});
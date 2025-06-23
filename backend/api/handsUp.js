import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import apiRoutes from './apiRoutes.js';
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
app.use()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.use('/handsUPApi', apiRoutes);

try {
    const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem'))
    };

    const httpsServer = https.createServer(httpsOptions, app);
    
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`
            
            HTTPS Server running on https://localhost:${HTTPS_PORT}`);
        console.log(`API available at https://localhost:${HTTPS_PORT}/handsUPApi`);
    });

    const httpApp = express();
    httpApp.use((req, res) => {
        const httpsUrl = `https://${req.headers.host.replace(/:\d+/, `:${HTTPS_PORT}`)}${req.url}`;
        console.log(`Redirecting HTTP to HTTPS: ${httpsUrl}`);
        res.redirect(301, httpsUrl);
    });

    http.createServer(httpApp).listen(HTTP_PORT, () => {
        console.log(`HTTP Server running on http://localhost:${HTTP_PORT} (redirects to HTTPS)`);
        console.log(`Type "shutdown" to stop the server.`);
    });

} catch (error) {
    console.error('SSL Certificate Error:', error.message);
    console.log('Make sure you have copied localhost+2.pem and localhost+2-key.pem to your server directory');
    console.log('Falling back to HTTP only...');
    
    app.listen(HTTP_PORT, () => {
        console.log(`⚠️  HTTP Server running on http://localhost:${HTTP_PORT} (HTTPS certificates not found)`);
        console.log(`Type "shutdown" to stop the server.`);
    });
}
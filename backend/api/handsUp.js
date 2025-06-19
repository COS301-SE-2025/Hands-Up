import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import apiRoutes from './apiRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 2000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,           
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.use(cookieParser());

app.use('/handsUPApi', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Type "shutdown" to stop the server.`);
});

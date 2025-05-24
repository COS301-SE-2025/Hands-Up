import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRoutes from './apiRoutes.js';

const app = express();
const PORT = 2000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(express.json());
app.use(cors());
app.use('/handsUPApi', apiRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Type "shutdown" to stop the server.`);
});

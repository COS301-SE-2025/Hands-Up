import express from 'express';
// import cors from 'cors';
import apiRoutes from './apiRoutes.js';

const app = express();
const PORT = 2000;

app.use('/handsupApi', apiRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Type "shutdown" to stop the server.`);
});

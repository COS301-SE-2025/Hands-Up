import { Router } from 'express';
import { pool } from '../utils.js';

const router = Router();

export const learningProgress = async (req, res) => {
  try {
    console.log(req.body);
    const {username} = req.body; // Use body for now until username is figured out - currently undefined
    console.log('Username:', username);

    const result = await pool.query(
        `SELECT * FROM learn JOIN users ON learn."userID"= users."userID" WHERE users.username = $1`,
        [username]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({
      success: error,
      error: 'Internal Server Error',
    });
  }
};

export default router;
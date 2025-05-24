import { Router } from 'express';
import { pool } from '../utils.js';

const router = Router();

export const learningProgress = async (req, res) => {
  try {
    const username = req.params.username; 

    if (!username) {
      return res.status(400).json({
        status: "error",
        message: 'Username is required',
      });
    }

    const result = await pool.query(
        `SELECT "lessonsCompleted", "signsLearned", streak, "currentLevel" FROM learn JOIN users ON learn."userID"= users."userID" WHERE users.username = $1`,
        [username]
    );

    res.status(200).json({
      status: "success",
      message: 'Learning progress retrieved successfully',
      data: result.rows,
    });

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({
      status: "error",
      message: 'Internal Server Error',
    });
  }
};

export default router;
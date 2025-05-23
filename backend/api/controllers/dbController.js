import { Router } from 'express';
import { pool } from '../utils.js';

const router = Router();

export const learningProgress = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      'SELECT * FROM users',
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

export default router;
import { Router } from 'express';
import { pool } from '../utils.js';

const router = Router();

export const learningProgress = async (req, res) => {

  if (req.method == 'GET') {
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

      if (result.rowCount === 0) {
        return res.status(404).json({
          status: "error",
          message: 'User not found',
        });
      }

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
  }
  else if (req.method == 'PUT') {
      try {
        const username = req.params.username;
        const progressData = req.body;

        if (!username || !progressData) {
          return res.status(400).json({
            status: "error",
            message: 'Username and progress data are required',
          });
        }

        const result = await pool.query(
          `UPDATE learn SET "lessonsCompleted" = $1, "signsLearned" = $2, streak = $3
           FROM users WHERE learn."userID" = users."userID" AND users.username = $4`,
          [
            progressData.lessonsCompleted,
            progressData.signsLearned,
            progressData.streak,
            username
          ]
        );

        if (result.rowCount === 0) {
          return res.status(404).json({
            status: "error",
            message: 'User not found or no progress updated',
          });
        }

        res.status(200).json({
          status: "success",
          message: 'Learning progress updated successfully',
        });

      } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({
          status: "error",
          message: 'Internal Server Error',
        });
      }
    }
};

export default router;
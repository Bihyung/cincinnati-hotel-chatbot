import express from 'express';
import statisticsService from '../services/statisticsService.js';

const router = express.Router();

// Get statistics for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const stats = await statisticsService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get recent sessions
router.get('/sessions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sessions = await statisticsService.getRecentSessions(limit);
    res.json(sessions);
  } catch (error) {
    console.error('Sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

export default router;

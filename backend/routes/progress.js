const express = require('express');
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const router = express.Router();

// All progress routes require auth
router.use(auth);

// ── POST /api/progress/attempt ────────────────────────────────────
// Save a query attempt (called every time user runs a query)
router.post('/attempt', async (req, res) => {
    try {
        const { assignmentId, sql, isCorrect } = req.body;
        if (!assignmentId || !sql)
            return res.status(400).json({ error: 'assignmentId and sql are required' });

        const update = {
            $push: { attempts: { sql, isCorrect, createdAt: new Date() } },
            $inc: { attemptCount: 1 },
        };
        // Only mark completed once (not undoable)
        if (isCorrect) {
            update.$set = { isCompleted: true, completedAt: new Date() };
        }

        const progress = await UserProgress.findOneAndUpdate(
            { userId: req.userId, assignmentId },
            update,
            { new: true, upsert: true }
        );

        res.json({ progress });
    } catch (err) {
        console.error('Progress save error:', err);
        res.status(500).json({ error: 'Could not save progress' });
    }
});

// ── GET /api/progress ────────────────────────────────────────────
// Get all progress records for the logged-in user
router.get('/', async (req, res) => {
    try {
        const progress = await UserProgress.find({ userId: req.userId }).select(
            'assignmentId isCompleted attemptCount completedAt attempts'
        );
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch progress' });
    }
});

// ── GET /api/progress/:assignmentId ──────────────────────────────
// Get progress for a specific assignment
router.get('/:assignmentId', async (req, res) => {
    try {
        const progress = await UserProgress.findOne({
            userId: req.userId,
            assignmentId: req.params.assignmentId,
        });
        res.json(progress || null);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch progress' });
    }
});

module.exports = router;

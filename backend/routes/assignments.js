const express = require('express');
const Assignment = require('../models/Assignment');
const router = express.Router();

// GET /api/assignments – list all (lightweight: no rows)
router.get('/', async (_req, res) => {
    try {
        const assignments = await Assignment.find(
            {},
            'title description question sampleTables.tableName sampleTables.columns createdAt'
        ).sort({ createdAt: 1 });
        res.json(assignments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// GET /api/assignments/:id – single assignment with full data
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch assignment' });
    }
});

module.exports = router;

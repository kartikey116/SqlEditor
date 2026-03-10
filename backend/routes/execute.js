const express = require('express');
const Assignment = require('../models/Assignment');
const pool = require('../config/neonPool');
const router = express.Router();

// Only allow read-only queries — strip comments first so
// "-- comment\nSELECT ..." is correctly recognised as a SELECT.
function isSafeQuery(sql) {
    const stripped = sql
        .replace(/--[^\n]*/g, '')          // remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')  // remove block comments /* ... */
        .trim()
        .toUpperCase();
    return stripped.startsWith('SELECT') || stripped.startsWith('WITH');
}

/**
 * Compare user's rows against the assignment's expectedOutput stored in MongoDB.
 * Rules:
 *  - Same number of rows
 *  - Every column present in expectedOutput must match (extra columns from user are OK)
 *  - Comparison is string-coerced so 60000 === "60000"
 */
function checkVerdict(rows, expectedOutput) {
    if (!expectedOutput || expectedOutput.type !== 'table') return null;
    const expected = expectedOutput.value ?? [];
    if (expected.length === 0) return null;
    if (rows.length !== expected.length) return false;

    return expected.every((eRow, i) =>
        Object.entries(eRow).every(([col, val]) =>
            String(rows[i]?.[col]) === String(val)
        )
    );
}

/**
 * POST /api/execute
 * Body: { assignmentId: string, sql: string }
 *
 * Isolation strategy:
 *   1. Open a pg client from pool
 *   2. BEGIN a transaction
 *   3. CREATE SCHEMA "sess_<id>"  (DDL is transactional in PostgreSQL ✅)
 *   4. SET LOCAL search_path → schema  (stays for this transaction)
 *   5. Create tables + insert sample rows
 *   6. Execute user SQL
 *   7. Compare rows against assignment.expectedOutput → isCorrect
 *   8. ROLLBACK → everything disappears cleanly (no manual DROP needed)
 */
router.post('/', async (req, res) => {
    const { assignmentId, sql: userSQL } = req.body;

    if (!assignmentId || !userSQL?.trim()) {
        return res.status(400).json({ error: 'assignmentId and sql are required' });
    }

    if (!isSafeQuery(userSQL)) {
        return res.status(400).json({
            error: 'Only SELECT queries are allowed. INSERT / UPDATE / DROP etc. are not permitted.',
        });
    }

    let assignment;
    try {
        assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    } catch {
        return res.status(400).json({ error: 'Invalid assignmentId' });
    }

    // Generate a safe schema name
    const schemaName = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let client;
    try {
        // pool.connect() is inside try so DNS/timeout failures return 400, not 500
        client = await pool.connect();

        await client.query('BEGIN');
        await client.query(`CREATE SCHEMA "${schemaName}"`);
        await client.query(`SET LOCAL search_path TO "${schemaName}"`);

        // ── Create tables & insert data ──────────────────────────
        for (const table of assignment.sampleTables) {
            const colDefs = table.columns
                .map(c => `"${c.columnName}" ${c.dataType}`)
                .join(', ');
            await client.query(`CREATE TABLE "${table.tableName}" (${colDefs})`);

            for (const row of table.rows) {
                const colNames = table.columns.map(c => `"${c.columnName}"`).join(', ');
                const placeholders = table.columns.map((_, i) => `$${i + 1}`).join(', ');
                const values = table.columns.map(c => row[c.columnName] ?? null);
                await client.query(
                    `INSERT INTO "${table.tableName}" (${colNames}) VALUES (${placeholders})`,
                    values
                );
            }
        }

        // ── Run user SQL ─────────────────────────────────────────
        const result = await client.query(userSQL);
        const columns = result.fields?.map(f => f.name) ?? [];
        const rows = result.rows ?? [];

        // ── Verdict: compare against expectedOutput from MongoDB ──
        const isCorrect = checkVerdict(rows, assignment.expectedOutput);

        // ── Rollback destroys the schema transactionally ─────────
        await client.query('ROLLBACK');

        return res.json({ columns, rows, rowCount: result.rowCount, isCorrect });

    } catch (err) {
        if (client) await client.query('ROLLBACK').catch(() => { });
        const isDbError = err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT';
        const message = isDbError
            ? '⚠️ Database connection failed — please check your NeonDB project is active at console.neon.tech'
            : err.message;
        return res.status(400).json({ error: message });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;

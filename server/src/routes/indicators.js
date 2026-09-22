const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

// GET /api/indicators - the predetermined system-wide indicator menu.
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, metric_name, phase_association, mathematical_weight
             FROM indicators_master
             ORDER BY metric_name ASC`
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// POST /api/indicators - create a new indicator signal.
router.post('/', async (req, res, next) => {
    try {
        const { metric_name, phase_association, mathematical_weight } = req.body;
        if (!metric_name || !metric_name.trim()) {
            return res.status(400).json({ error: 'Indicator name (metric_name) is required.' });
        }
        if (!['ovulation', 'period'].includes(phase_association)) {
            return res.status(400).json({ error: "phase_association must be either 'ovulation' or 'period'." });
        }
        const weight = parseFloat(mathematical_weight);
        if (isNaN(weight) || weight <= 0) {
            return res.status(400).json({ error: 'mathematical_weight must be a positive number.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO indicators_master (metric_name, phase_association, mathematical_weight)
             VALUES ($1, $2, $3)
             ON CONFLICT (metric_name) DO UPDATE
               SET phase_association = EXCLUDED.phase_association,
                   mathematical_weight = EXCLUDED.mathematical_weight
             RETURNING id, metric_name, phase_association, mathematical_weight`,
            [metric_name.trim(), phase_association, weight]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

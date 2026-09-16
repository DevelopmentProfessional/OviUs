const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

// GET /api/indicators - the predetermined system-wide indicator menu.
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, metric_name, phase_association, mathematical_weight
             FROM indicators_master
             ORDER BY phase_association ASC, mathematical_weight DESC, metric_name ASC`
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

const express = require('express');
const { pool } = require('../db/pool');
const { predictClientCycle } = require('../engine/cycleEngine');

const router = express.Router();

function toDateKey(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// GET /api/calendar?month=YYYY-MM
// Returns predicted ovulation milestones for every client, grouped by calendar date,
// so the master calendar can render overlapping/group circles.
router.get('/', async (req, res, next) => {
    try {
        const monthParam = req.query.month; // e.g. "2026-09"
        const now = new Date();
        const [year, month] = monthParam
            ? monthParam.split('-').map(Number)
            : [now.getUTCFullYear(), now.getUTCMonth() + 1];

        const monthStart = new Date(Date.UTC(year, month - 1, 1));
        const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));

        const clientsResult = await pool.query(
            `SELECT c.id, c.name, c.created_at, p.favorite_color, p.avatar_url
             FROM clients c
             LEFT JOIN client_profiles p ON p.client_id = c.id
             ORDER BY c.name ASC`
        );
        const logsResult = await pool.query(
            `SELECT l.client_id, l.logged_at, l.value_magnitude,
                    m.phase_association, m.mathematical_weight
             FROM indicator_logs l
             JOIN indicators_master m ON m.id = l.indicator_id
             ORDER BY l.logged_at ASC`
        );

        const logsByClient = new Map();
        for (const log of logsResult.rows) {
            if (!logsByClient.has(log.client_id)) logsByClient.set(log.client_id, []);
            logsByClient.get(log.client_id).push(log);
        }

        const milestonesByDate = new Map(); // dateKey -> [{ clientId, name }]

        for (const clientRow of clientsResult.rows) {
            const logs = logsByClient.get(clientRow.id) || [];
            const { upcomingOvulationDates, cycleLengthDays } = predictClientCycle(
                clientRow.created_at,
                logs,
                { now, projectionCount: 6 } // enough cycles to cover several months ahead
            );

            for (const date of upcomingOvulationDates) {
                if (date < monthStart || date > monthEnd) continue;
                const key = toDateKey(date);
                if (!milestonesByDate.has(key)) milestonesByDate.set(key, []);
                milestonesByDate.get(key).push({
                    clientId: clientRow.id,
                    name: clientRow.name,
                    favoriteColor: clientRow.favorite_color,
                    avatarUrl: clientRow.avatar_url,
                    cycleLengthDays,
                });
            }
        }

        const calendar = {};
        for (const [date, entries] of milestonesByDate.entries()) {
            calendar[date] = entries.sort((a, b) => a.name.localeCompare(b.name));
        }

        res.json({ month: `${year}-${String(month).padStart(2, '0')}`, days: calendar });
    } catch (err) {
        next(err);
    }
});

// GET /api/calendar/client/:id - full prediction diagnostics for a single client.
router.get('/client/:id', async (req, res, next) => {
    try {
        const clientResult = await pool.query(
            `SELECT id, name, created_at FROM clients WHERE id = $1`,
            [req.params.id]
        );
        if (clientResult.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const clientRow = clientResult.rows[0];

        const logsResult = await pool.query(
            `SELECT l.client_id, l.logged_at, l.value_magnitude,
                    m.phase_association, m.mathematical_weight
             FROM indicator_logs l
             JOIN indicators_master m ON m.id = l.indicator_id
             WHERE l.client_id = $1
             ORDER BY l.logged_at ASC`,
            [req.params.id]
        );

        const prediction = predictClientCycle(clientRow.created_at, logsResult.rows, {
            projectionCount: 3,
        });

        res.json({
            clientId: clientRow.id,
            name: clientRow.name,
            ...prediction,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

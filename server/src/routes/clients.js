const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

// GET /api/clients - list all clients with their profile, alphabetically by name.
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT c.id, c.name, c.created_at,
                    p.favorite_color, p.likes, p.dislikes, p.notes
             FROM clients c
             LEFT JOIN client_profiles p ON p.client_id = c.id
             ORDER BY c.name ASC`
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/clients/:id - single client + profile.
router.get('/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT c.id, c.name, c.created_at,
                    p.favorite_color, p.likes, p.dislikes, p.notes
             FROM clients c
             LEFT JOIN client_profiles p ON p.client_id = c.id
             WHERE c.id = $1`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// POST /api/clients - create client + initial profile. Creation date becomes Ovulation Day 0.
router.post('/', async (req, res, next) => {
    const { name, favorite_color, likes = [], dislikes = [], notes = '' } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Client name is required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO clients (name) VALUES ($1) RETURNING id, name, created_at`,
            [name.trim()]
        );
        const newClient = rows[0];
        await client.query(
            `INSERT INTO client_profiles (client_id, favorite_color, likes, dislikes, notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [newClient.id, favorite_color || null, likes, dislikes, notes || '']
        );
        await client.query('COMMIT');
        res.status(201).json({
            ...newClient,
            favorite_color: favorite_color || null,
            likes,
            dislikes,
            notes: notes || '',
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

// PUT /api/clients/:id/profile - update qualitative profile fields.
router.put('/:id/profile', async (req, res, next) => {
    const { favorite_color, likes = [], dislikes = [], notes = '' } = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE client_profiles
             SET favorite_color = $2, likes = $3, dislikes = $4, notes = $5
             WHERE client_id = $1
             RETURNING client_id, favorite_color, likes, dislikes, notes`,
            [req.params.id, favorite_color || null, likes, dislikes, notes || '']
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Client profile not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Client not found' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

// GET /api/clients/:id/logs - indicator log history for a client, most recent first.
router.get('/:id/logs', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT l.id, l.client_id, l.indicator_id, l.logged_at, l.value_magnitude,
                    m.metric_name, m.phase_association, m.mathematical_weight
             FROM indicator_logs l
             JOIN indicators_master m ON m.id = l.indicator_id
             WHERE l.client_id = $1
             ORDER BY l.logged_at DESC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// POST /api/clients/:id/logs - log an indicator observation with an adjustable timestamp.
router.post('/:id/logs', async (req, res, next) => {
    const { indicator_id, logged_at, value_magnitude = 1.0 } = req.body;
    if (!indicator_id) return res.status(400).json({ error: 'indicator_id is required' });

    try {
        const { rows } = await pool.query(
            `INSERT INTO indicator_logs (client_id, indicator_id, logged_at, value_magnitude)
             VALUES ($1, $2, COALESCE($3, now()), $4)
             RETURNING id, client_id, indicator_id, logged_at, value_magnitude`,
            [req.params.id, indicator_id, logged_at || null, value_magnitude]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clientsRouter = require('./routes/clients');
const indicatorsRouter = require('./routes/indicators');
const calendarRouter = require('./routes/calendar');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientsRouter);
app.use('/api/indicators', indicatorsRouter);
app.use('/api/calendar', calendarRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Centralized error handler.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`OviUs API listening on port ${PORT}`);
});

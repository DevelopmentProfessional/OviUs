/**
 * Core self-correcting weighted probability engine for cycle prediction.
 *
 * Rules implemented (see product spec section 3):
 *  - Baseline: client creation date = Ovulation Day 0, default 28-day cycle.
 *  - Dynamic Complete Shift: a single high-weight opposing indicator immediately
 *    replaces the baseline/current anchor (no averaging).
 *  - Accumulated Shift: multiple low-weight opposing indicators can still shift the
 *    anchor once their combined recency-weighted score crosses a threshold.
 *  - Recency Bias: all indicator scores decay exponentially with age so recent
 *    observations dominate the outlook, letting the model track cycle drift.
 */

const DEFAULT_CYCLE_LENGTH_DAYS = 28;
const LUTEAL_PHASE_OFFSET_DAYS = 14; // days from ovulation to the following period
const HIGH_WEIGHT_THRESHOLD = 7.0; // weight at/above this triggers an immediate full shift
const ACCUMULATION_SHIFT_THRESHOLD = 10.0; // combined decayed low-weight score needed to shift
const RECENCY_HALF_LIFE_DAYS = 45; // decayed score halves every N days of age
const MIN_CYCLE_LENGTH_DAYS = 21;
const MAX_CYCLE_LENGTH_DAYS = 45;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a, b) {
    return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

function addDays(date, days) {
    return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Exponential recency decay: weight halves every RECENCY_HALF_LIFE_DAYS of age. */
function decayFactor(ageDays) {
    if (ageDays <= 0) return 1;
    return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

/**
 * Walk logs chronologically, applying dynamic-shift / accumulated-shift rules,
 * and return the ordered sequence of confirmed "anchor events" (phase + date).
 */
function computeAnchors(logs, createdAt, now) {
    const anchors = [{ phase: 'ovulation', date: new Date(createdAt), source: 'baseline' }];

    // Running decayed-score tally of opposing-phase evidence since the last anchor.
    let tally = { ovulation: [], period: [] };

    for (const log of logs) {
        const currentAnchor = anchors[anchors.length - 1];
        const ageDays = Math.max(0, daysBetween(new Date(log.logged_at), now));
        const decayedScore = log.mathematical_weight * Number(log.value_magnitude) * decayFactor(ageDays);
        const phase = log.phase_association;

        if (log.mathematical_weight >= HIGH_WEIGHT_THRESHOLD) {
            // Strong signal: completely replace the baseline/current anchor, no averaging.
            anchors.push({ phase, date: new Date(log.logged_at), source: 'high-weight-shift' });
            tally = { ovulation: [], period: [] };
            continue;
        }

        if (phase === currentAnchor.phase) {
            // Supporting evidence for the existing anchor phase; no shift needed.
            continue;
        }

        // Low-weight opposing evidence accumulates until it crosses the threshold.
        tally[phase].push({ date: new Date(log.logged_at), score: decayedScore });
        const cumulativeScore = tally[phase].reduce((sum, e) => sum + e.score, 0);

        if (cumulativeScore >= ACCUMULATION_SHIFT_THRESHOLD) {
            // Weighted-centroid date of the contributing observations becomes the new anchor.
            const totalScore = tally[phase].reduce((sum, e) => sum + e.score, 0);
            const weightedTime = tally[phase].reduce(
                (sum, e) => sum + e.date.getTime() * e.score,
                0
            );
            const centroidDate = new Date(weightedTime / totalScore);
            anchors.push({ phase, date: centroidDate, source: 'accumulated-shift' });
            tally = { ovulation: [], period: [] };
        }
    }

    return anchors;
}

/**
 * Derive an adaptive cycle length from the intervals between consecutive
 * same-phase anchors, weighting more recent intervals more heavily (drift-aware).
 */
function computeCycleLength(anchors, now) {
    const byPhase = { ovulation: [], period: [] };
    for (const a of anchors) byPhase[a.phase].push(a.date);

    const intervals = [];
    for (const phase of ['ovulation', 'period']) {
        const dates = byPhase[phase];
        for (let i = 1; i < dates.length; i++) {
            const lengthDays = daysBetween(dates[i - 1], dates[i]);
            if (lengthDays >= MIN_CYCLE_LENGTH_DAYS && lengthDays <= MAX_CYCLE_LENGTH_DAYS) {
                const ageDays = Math.max(0, daysBetween(dates[i], now));
                intervals.push({ lengthDays, weight: decayFactor(ageDays) });
            }
        }
    }

    if (intervals.length === 0) return DEFAULT_CYCLE_LENGTH_DAYS;

    const totalWeight = intervals.reduce((sum, e) => sum + e.weight, 0);
    const weightedLength = intervals.reduce((sum, e) => sum + e.lengthDays * e.weight, 0);
    return weightedLength / totalWeight;
}

/**
 * Project the next `count` upcoming ovulation dates from the latest anchor.
 */
function projectOvulationDates(anchors, cycleLength, now, count = 3) {
    const latest = anchors[anchors.length - 1];

    // Normalize to the ovulation date implied by the latest anchor's cycle.
    let baseOvulationDate =
        latest.phase === 'ovulation'
            ? latest.date
            : addDays(latest.date, cycleLength - LUTEAL_PHASE_OFFSET_DAYS);

    // Fast-forward to the first ovulation date that is not in the past.
    while (daysBetween(baseOvulationDate, now) > cycleLength) {
        baseOvulationDate = addDays(baseOvulationDate, cycleLength);
    }
    while (daysBetween(baseOvulationDate, now) > 0.5) {
        baseOvulationDate = addDays(baseOvulationDate, cycleLength);
    }

    const dates = [];
    let cursor = baseOvulationDate;
    for (let i = 0; i < count; i++) {
        dates.push(new Date(cursor));
        cursor = addDays(cursor, cycleLength);
    }
    return dates;
}

/**
 * Full pipeline: given a client's creation date and its indicator logs
 * (each joined with phase_association + mathematical_weight), return the
 * predicted upcoming ovulation dates plus supporting diagnostics.
 */
function predictClientCycle(createdAt, logs, { now = new Date(), projectionCount = 3 } = {}) {
    const sortedLogs = [...logs].sort(
        (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    );

    const anchors = computeAnchors(sortedLogs, createdAt, now);
    const cycleLength = computeCycleLength(anchors, now);
    const upcomingOvulationDates = projectOvulationDates(anchors, cycleLength, now, projectionCount);

    return {
        anchors,
        cycleLengthDays: Math.round(cycleLength * 10) / 10,
        upcomingOvulationDates,
    };
}

module.exports = {
    predictClientCycle,
    computeAnchors,
    computeCycleLength,
    projectOvulationDates,
    DEFAULT_CYCLE_LENGTH_DAYS,
    LUTEAL_PHASE_OFFSET_DAYS,
    HIGH_WEIGHT_THRESHOLD,
    ACCUMULATION_SHIFT_THRESHOLD,
    RECENCY_HALF_LIFE_DAYS,
};

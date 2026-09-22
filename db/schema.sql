-- OviUs: Multi-Client Algorithmic Menstrual Tracker
-- PostgreSQL schema

CREATE TABLE IF NOT EXISTS clients (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_profiles (
    client_id            INTEGER PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    favorite_color       VARCHAR(50),
    likes                TEXT[] DEFAULT '{}',
    dislikes             TEXT[] DEFAULT '{}',
    notes                TEXT,
    avatar_url           TEXT
);

-- Phase_Association: 'ovulation' or 'period'
CREATE TABLE IF NOT EXISTS indicators_master (
    id                   SERIAL PRIMARY KEY,
    metric_name          VARCHAR(100) NOT NULL UNIQUE,
    phase_association    VARCHAR(10) NOT NULL CHECK (phase_association IN ('ovulation', 'period')),
    mathematical_weight  NUMERIC(5,2) NOT NULL CHECK (mathematical_weight > 0)
);

CREATE TABLE IF NOT EXISTS indicator_logs (
    id                SERIAL PRIMARY KEY,
    client_id         INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    indicator_id      INTEGER NOT NULL REFERENCES indicators_master(id) ON DELETE CASCADE,
    logged_at         TIMESTAMPTZ NOT NULL DEFAULT now(), -- adjustable observation timestamp
    value_magnitude   NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indicator_logs_client ON indicator_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_indicator_logs_logged_at ON indicator_logs(logged_at);

#!/usr/bin/env bash
# One-time EC2 setup for OviUs. Run as: bash setup-server.sh
# Assumes Ubuntu/Amazon Linux with PostgreSQL already installed and running.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/OviUs}"
REPO_URL="${REPO_URL:-https://github.com/DevelopmentProfessional/OviUs.git}"
DB_NAME="${DB_NAME:-ovius}"
DB_USER="${DB_USER:-ovius_app}"

echo "== Installing Node.js (if missing) =="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "== Installing pm2 and nginx (if missing) =="
sudo npm install -g pm2
sudo apt-get install -y nginx

echo "== Cloning/updating repo at $APP_DIR =="
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "== Creating application database role/database (idempotent) =="
sudo -u postgres psql -v ON_ERROR_STOP=0 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_APP_PASSWORD:?Set DB_APP_PASSWORD env var before running}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL

echo "== Writing server/.env =="
cat > "$APP_DIR/server/.env" <<ENV
PORT=4000
DATABASE_URL=postgres://${DB_USER}:${DB_APP_PASSWORD}@localhost:5432/${DB_NAME}
ENV

echo "== Installing dependencies =="
cd "$APP_DIR/server" && npm ci --omit=dev
cd "$APP_DIR/client" && npm ci

echo "== Applying schema + seed data =="
cd "$APP_DIR/server" && npm run db:init

echo "== Building frontend =="
cd "$APP_DIR/client" && npm run build

echo "== Starting API with pm2 =="
cd "$APP_DIR" && pm2 start deploy/ecosystem.config.js
pm2 save
sudo pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | sudo bash || true

echo "== Done. Configure nginx to serve client/dist and proxy /api to localhost:4000 =="

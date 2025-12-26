-- Create separate DB + user for n8n inside the same Postgres container
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n') THEN
    CREATE DATABASE n8n;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'n8n') THEN
    CREATE USER n8n WITH PASSWORD 'n8n_password_change_me';
  END IF;
END $$;

GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;

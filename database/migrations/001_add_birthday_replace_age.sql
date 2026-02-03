-- Replace age with birthday on users table (Railway / PostgreSQL)
-- Run this once on your existing database.

ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;
-- Optional: migrate existing age to approximate birthday (birth year only)
-- UPDATE users SET birthday = (CURRENT_DATE - (age || ' years')::interval)::date WHERE age IS NOT NULL AND birthday IS NULL;
ALTER TABLE users DROP COLUMN IF EXISTS age;

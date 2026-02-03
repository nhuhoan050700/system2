-- Add address to users table (Railway / PostgreSQL)
-- Run once on your existing database.

ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

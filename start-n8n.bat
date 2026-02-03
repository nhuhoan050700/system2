@echo off
REM Start n8n on port 7035 with CORS for frontend + worker dashboard
set N8N_PORT=7035
set N8N_CORS_ALLOW_ORIGIN=http://localhost:7030,http://localhost:7032
n8n start

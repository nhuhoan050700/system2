@echo off
REM Deploy Hospital Testing Service Center to Vercel
REM Run this from the project root (d:\system2)

echo === Deploying to Vercel ===
echo.

REM 1. Deploy Frontend (patient app)
echo [1/2] Deploying Frontend...
cd frontend
call npx vercel --prod
if %ERRORLEVEL% neq 0 (
  echo Frontend deploy failed. Make sure you have run: npx vercel login
  cd ..
  exit /b 1
)
cd ..

echo.
REM 2. Deploy Worker Dashboard (staff app)
echo [2/2] Deploying Worker Dashboard...
cd worker-dashboard
call npx vercel --prod
if %ERRORLEVEL% neq 0 (
  echo Worker dashboard deploy failed.
  cd ..
  exit /b 1
)
cd ..

echo.
echo === Deployment complete ===
echo.
echo Next steps:
echo 1. Copy the frontend URL and add to Vercel env: NEXT_PUBLIC_APP_URL
echo 2. Add SePay IPN URL in SePay dashboard: https://YOUR-FRONTEND-URL/api/payment/sepay/ipn
echo 3. Update Google OAuth with your production URLs (origins + redirect URIs)
echo.

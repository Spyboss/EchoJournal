@echo off
echo ========================================
echo   Echo Journal Deployment Script
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying to Firebase...
call firebase deploy
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo [4/4] Deployment completed successfully!
echo.
echo Your app is now live at:
echo https://studio--echo-journal-hnzep.us-central1.hosted.app/
echo.
echo Pulse API endpoints available at:
echo https://studio--echo-journal-hnzep.us-central1.hosted.app/api/pulse
echo.
pause
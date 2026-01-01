@echo off
echo ========================================
echo   Starting Hercycle Application
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Hercycle Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "Hercycle Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Hercycle is Starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo ========================================
pause

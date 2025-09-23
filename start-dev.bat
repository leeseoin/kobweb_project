@echo off
echo Starting Kobweb Development Environment...
echo.

REM 백엔드 실행 (새 창에서)
echo Starting Backend Server...
start "Backend Server" cmd /k "cd kobweb_back && gradlew.bat bootRun"

REM 3초 대기
timeout /t 3

REM 프론트엔드 실행 (새 창에서)
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd kobweb_pront && npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3000
echo.
pause
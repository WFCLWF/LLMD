@echo off
title LLMD Launcher
cd /d "%~dp0"

echo.
echo   ============================================
echo          LLMD - AI Chat Assistant
echo   ============================================
echo.
echo   Project : %~dp0
echo.

REM Try conda env, fallback to system python
where conda >nul 2>nul && call conda activate LLMD 2>nul

echo   [1/2] Starting Python backend on port 8054 ...
start "LLMD Backend" /min cmd /c "cd /d "%~dp0" && python backend\main.py"

echo   [2/2] Starting frontend (Vite + Electron) ...
start "LLMD Frontend" /min cmd /c "cd /d "%~dp0" && npm run dev"

echo.
echo   Backend : http://127.0.0.1:8054
echo   Frontend: http://localhost:5173
echo.
echo   Services starting. Close this window when done.
pause

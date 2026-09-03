@echo off
REM ========================================================
REM Antigravity 2.0 zh-Hant-TW package - restore
REM ========================================================
title Antigravity 2.0 zh-Hant-TW - Restore

echo.
echo ========================================================
echo   Antigravity 2.0 zh-Hant-TW package - restore
echo ========================================================
echo.

REM Check Node.js
echo [Precheck] Checking Node.js...
node -v >nul 2>nul
if errorlevel 1 (
    echo.
    echo [Error] Node.js is not available.
    echo   Install Node.js LTS from https://nodejs.org/
    echo   and make sure node is available in PATH.
    echo   If Access Denied appears, reinstall Node.js and check PATH.
    echo.
    pause
    exit /b 1
)

REM Check local @electron/asar
if not exist "%~dp0node_modules\@electron\asar\bin\asar.js" (
    echo.
    echo [Error] Local @electron/asar CLI was not found.
    echo   Run this in the package root first:
    echo     npm install
    echo   Then run this restore script again.
    echo.
    pause
    exit /b 1
)

echo [Precheck] Node.js and asar CLI are ready.
echo.

echo [1/3] Closing Antigravity processes...
taskkill /f /im Antigravity.exe /t >nul 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Restoring original files...
node "%~dp0localization_engine.js" --restore %*

echo.
echo [3/3] Done.
echo.
echo [Note] Restart Antigravity manually to apply changes.
echo.
pause

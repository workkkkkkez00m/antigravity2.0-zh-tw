@echo off
REM ========================================================
REM Antigravity 2.0 zh-Hant-TW package - install
REM ========================================================
title Antigravity 2.0 zh-Hant-TW - Install

echo.
echo ========================================================
echo   Antigravity 2.0 zh-Hant-TW package
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
    echo   Then run this install script again.
    echo.
    pause
    exit /b 1
)

echo [Precheck] Node.js and asar CLI are ready.
echo.

echo [1/3] Confirm before force quitting Antigravity and installing.
echo [2/3] Preparing localization...
node "%~dp0localization_engine.js" %*
set "exit_code=%errorlevel%"
if "%exit_code%"=="2" (
    echo.
    echo [Cancelled] Installation cancelled.
    echo.
    pause
    exit /b %exit_code%
)
if not "%exit_code%"=="0" (
    echo.
    echo [Error] Installation failed.
    echo.
    pause
    exit /b %exit_code%
)

echo.
echo [3/3] Done.
echo.
echo [Note] Restart Antigravity manually to apply changes.
echo.
pause
exit /b 0

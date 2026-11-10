@echo off
title Push Vichu Proposal to GitHub
color 0D
echo ========================================================
echo    Pushing Vichu Interactive Proposal to GitHub...
echo ========================================================
echo.

cd /d "E:\test"
git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo    SUCCESS! Site is being published to:
    echo    https://erenXT250.github.io/Vichu/
) else (
    echo    If it asked to sign in, complete the browser
    echo    prompt and run this file again.
)
echo ========================================================
echo.
pause

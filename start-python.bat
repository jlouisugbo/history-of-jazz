@echo off
cd /d "%~dp0"
title Jazz Quiz (Python)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -LiteralPath '.' -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue" >nul 2>nul

where python >nul 2>nul && set PY=python && goto run
where py >nul 2>nul && set PY=py -3 && goto run
where python3 >nul 2>nul && set PY=python3 && goto run

echo Python 3 not found.
echo Install from https://www.python.org/downloads/
echo Check "Add python.exe to PATH" during install.
pause
exit /b 1

:run
echo Starting quiz with Python...
%PY% serve.py
pause

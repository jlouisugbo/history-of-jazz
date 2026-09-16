@echo off
cd /d "%~dp0"
title Jazz Quiz

REM Strip "downloaded from internet" flags (helps SmartScreen; SAC may still block unsigned exe)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -LiteralPath '.' -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue" >nul 2>nul

echo Jazz quiz launcher
echo.

REM Signed python.org runtime — usually allowed by Smart App Control
where python >nul 2>nul && set PY=python && goto python
where py >nul 2>nul && set PY=py -3 && goto python
where python3 >nul 2>nul && set PY=python3 && goto python

if exist jazz-quiz.exe goto runexe

where go >nul 2>nul && goto build

goto sac_help

:runexe
echo Starting jazz-quiz.exe...
jazz-quiz.exe
if not errorlevel 1 exit /b 0
echo.
echo jazz-quiz.exe failed to start.
goto try_python

:python
echo Starting with Python...
%PY% serve.py
if not errorlevel 1 exit /b 0
goto sac_help

:build
echo Building jazz-quiz.exe on this PC...
go build -ldflags="-s -w" -o jazz-quiz.exe .
if errorlevel 1 goto sac_help
goto runexe

:try_python
where python >nul 2>nul && set PY=python && goto python
where py >nul 2>nul && set PY=py -3 && goto python
where python3 >nul 2>nul && set PY=python3 && goto python
goto sac_help

:sac_help
echo.
echo Could not start the quiz server.
echo.
echo Windows Smart App Control blocks unsigned apps downloaded from the web.
echo This app is safe — it only serves files from this folder on your PC.
echo.
echo Easiest fix: install Python 3, then run start.bat again
echo   https://www.python.org/downloads/
echo   Check "Add python.exe to PATH" during install.
echo.
echo Or allow unsigned apps temporarily:
echo   Settings ^> Privacy and security ^> Windows Security
echo   ^> App and browser control ^> Smart App Control settings
echo   Set to Evaluation mode (or Off), then run start.bat again.
echo.
echo Before unzipping: right-click the zip ^> Properties ^> check Unblock ^> OK
echo.
pause
exit /b 1

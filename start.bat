@echo off
cd /d "%~dp0"

if exist jazz-quiz.exe (
  jazz-quiz.exe
  exit /b 0
)

echo No jazz-quiz.exe found.
where go >nul 2>nul && goto build
where python >nul 2>nul && set PY=python && goto python
where python3 >nul 2>nul && set PY=python3 && goto python

echo Install Go from https://go.dev/dl/ and run build.sh, or install Python.
pause
exit /b 1

:build
echo Building jazz-quiz.exe...
go build -ldflags="-s -w" -o jazz-quiz.exe .
if errorlevel 1 pause & exit /b 1
jazz-quiz.exe
exit /b 0

:python
echo Using Python fallback...
%PY% serve.py
if errorlevel 1 pause

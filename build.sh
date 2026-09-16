#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

echo "Building jazz-quiz for this machine…"
go build -ldflags="-s -w" -o jazz-quiz .

echo "Building jazz-quiz.exe for Windows…"
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o jazz-quiz.exe .

echo "Done."
echo "  Mac/Linux: ./jazz-quiz  or double-click start.command"
echo "  Windows:   jazz-quiz.exe  or double-click start.bat"

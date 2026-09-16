#!/bin/bash
cd "$(dirname "$0")"

if [ -x "./jazz-quiz" ]; then
  ./jazz-quiz
  exit $?
fi

echo "No jazz-quiz binary found. Building…"
if ! command -v go >/dev/null 2>&1; then
  echo "Install Go from https://go.dev/dl/ and run ./build.sh"
  echo "Or use Python fallback: python3 serve.py"
  read -r -p "Press Enter to close."
  exit 1
fi
go build -ldflags="-s -w" -o jazz-quiz .
./jazz-quiz

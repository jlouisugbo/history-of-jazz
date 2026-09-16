# History of Jazz listening quiz

Local quiz + study mode. No cloud, no npm build.

## Quick start (no Python needed)

### Mac

1. Download/unzip the folder (must include `jazz-quiz`, `quiz/`, `exam1/`).
2. Double-click **`start.command`** (or run `./jazz-quiz` in Terminal).
3. Browser opens automatically. Leave the window open; **Ctrl+C** to stop.

First time on Mac without the binary: run `./build.sh` once (requires [Go](https://go.dev/dl/)), then use `start.command`.

### Windows

1. Download/unzip the folder (must include `jazz-quiz.exe`, `quiz/`, `exam1/`).
2. Double-click **`start.bat`** (or run `jazz-quiz.exe`).
3. Browser opens automatically. **Ctrl+C** to stop.

First time on Windows without the exe: install [Go](https://go.dev/dl/), run `build.sh` from Git Bash or `go build -o jazz-quiz.exe .` in cmd.

Quiz URL: http://127.0.0.1:8765/quiz/

## Build the standalone binary

From this folder (one-time, needs Go installed):

```bash
./build.sh
```

Creates:
- **`jazz-quiz`** — Mac/Linux (current machine)
- **`jazz-quiz.exe`** — Windows (cross-compiled from Mac/Linux)

To ship to classmates, zip the folder with the binary + `quiz/` + `exam1/` + `start.command` / `start.bat`. They do **not** need Python or Go.

Typical size: ~6–8 MB per binary.

## Python fallback

If you prefer not to build Go:

```bash
python3 serve.py
```

Same URL. Requires Python 3.

## Modes

**Quiz** — 10 random 60-second excerpts, 15 choices. Match by **title or artist** (2 pts each).

**Study** — full tracks in random order. Listen, then **Show answer**. Keys: space play, S reveal, N next.

## Add exam 2 later

1. Drop MP3s in `exam2/`.
2. Copy the `exam1` block in `quiz/catalog.json`; set `id`, `title`, `audioDir` to `/exam2`.
3. Add `tracks` with `file`, `title`, and `artist`.

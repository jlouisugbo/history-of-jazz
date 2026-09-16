# History of Jazz listening quiz

Local quiz + study mode. No cloud, no npm build.

## Quick start (no Python needed)

### Mac

1. Download/unzip the folder (must include `jazz-quiz`, `quiz/`, `exam1/`).
2. Double-click **`start.command`** (or run `./jazz-quiz` in Terminal).
3. Browser opens automatically. Leave the window open; **Ctrl+C** to stop.

First time on Mac without the binary: run `./build.sh` once (requires [Go](https://go.dev/dl/)), then use `start.command`.

### Windows

1. **Before unzipping:** right-click the zip → **Properties** → check **Unblock** → OK.
2. Unzip the folder (needs `quiz/`, `exam1/`, and `start.bat`).
3. Double-click **`start.bat`**. Browser opens automatically. **Ctrl+C** to stop.

**Smart App Control blocked it?** Windows 11 often blocks unsigned `.exe` files from the internet — even safe local apps like this one. That is normal; the app is not malware.

Pick one fix:

| Fix | What to do |
|-----|------------|
| **Easiest** | Install [Python 3](https://www.python.org/downloads/) (check **Add python.exe to PATH**). Run **`start.bat`** again — it uses Python automatically. Or use **`start-python.bat`**. |
| **One-time Windows setting** | Settings → Privacy & security → Windows Security → App & browser control → **Smart App Control settings** → set to **Evaluation mode** (or Off). Run `start.bat` again. |
| **Build locally** | Install [Go](https://go.dev/dl/), run `go build -o jazz-quiz.exe .` in this folder, then `start.bat`. |

There is no free way to make a custom `.exe` look “signed” to Smart App Control without buying a [code signing certificate](https://learn.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools) (~$200+/year). For a class zip, **Python launcher** or **Evaluation mode** is the practical path.

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

# History of Jazz listening quiz

Local 10-excerpt / 15-choice practice. No install, no cloud, no build.

## Why Python

macOS already ships `python3`. The quiz is static HTML/JS in `quiz/`; the browser shuffles tracks, picks 60-second excerpts, and grades. Python is only a local HTTP server.

Do not open `quiz/index.html` as `file://`. Browsers block `fetch("./catalog.json")` and MP3 seeking on `file://`. `python3 -m http.server` from `quiz/` also 404s the exam audio: paths are `/exam1/...`, which only exist at the **repo root**.

## Run

From this folder (the repo root):

```bash
python3 serve.py
```

Then open http://127.0.0.1:8765/quiz/

Same thing with the stdlib server (still from the repo root, not `quiz/`):

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Stop with Ctrl+C.

## How scoring works

Every track has a **title** and a **billed artist**. Either is correct. Duplicate artists collapse: Duke Ellington is valid for East St. Louis Toodle-Oo, Black and Tan Fantasy, and Mood Indigo. Same for Bessie Smith, Louis Armstrong, Fletcher Henderson, and Count Basie.

Each attempt draws 10 tracks from the full exam folder, then 15 unique labels from the title∪artist pool (with coverage so every excerpt has at least one valid choice on the sheet).

## Study mode

From the start screen, choose **Study — Exam 1**. Full tracks play in a shuffled deck. Title and artist stay hidden until you click **Show answer** (or press `S`). **Next track** picks the next song in the deck; when the deck runs out it reshuffles. Keys: space play/pause, S show/hide, N next, ← → prev/next.

## Add exam 2 later

1. Drop the new MP3s in `exam2/`.
2. Copy the `exam1` object in `quiz/catalog.json`. Set `id`, `title`, and `audioDir` to `/exam2`.
3. Fill `tracks` with `file`, `title`, and a short billed `artist` (reuse the same artist string when it is the same person).

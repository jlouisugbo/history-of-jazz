# History of Jazz — listening quiz

A static listening study app: **quiz mode** (60-second excerpts) and **study mode** (full tracks). No backend — just HTML, audio files, and a JSON catalog.

**Live site:** https://jlouisugbo.github.io/history-of-jazz/quiz/

Share that link with anyone in the class. Works in any browser; nothing to install.

---

## Using the app

### Quiz mode
- 10 random excerpts per attempt, up to 15 answer choices (fewer if the exam pool is smaller)
- **Exams 1 and 2:** match by **song title** or **billed artist** (either counts). Shared artists count for every matching excerpt.
- **Exam 3:** only labels on the exam sheet count (`answerMode: "listed"` in `catalog.json`). Choices and scoring use those strings only.
- Excerpts start at a random point from 0:00 to one minute before the end
- Keyboard: **A–O** answer · **space** play · **R** replay · **N** new excerpt · **← →** navigate

### Study mode
- Full tracks in shuffled order
- Listen first, then **Show answer** (**S**)
- **space** play/pause · **N** next · **← →** prev/next

---

## Deploying

The site is a static folder. Push to `main` and a host serves `quiz/`, `exam1/`, and the MP3s as-is.

| Host | Cost | Good for |
|------|------|----------|
| [GitHub Pages](https://pages.github.com/) | Free | Simplest — repo is already on GitHub |
| [Vercel](https://vercel.com/) | Free | Auto-redeploy on every push |

Both handle 50+ users easily (static audio + ~100 GB/month bandwidth on free tiers).

### GitHub Pages

1. Push `main` (include `exam1/` MP3s and `quiz/catalog.json`).
2. Repo **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch** → **main** → **`/ (root)`** → Save
4. Site goes live at `https://<username>.github.io/<repo>/quiz/`

This repo: **https://jlouisugbo.github.io/history-of-jazz/quiz/**

`.nojekyll` at the repo root tells GitHub Pages not to run Jekyll. Root `index.html` redirects to `/quiz/`.

### Vercel

1. Push the same repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Deploy with defaults. `vercel.json` redirects `/` → `/quiz/` and sets audio cache headers.

URL: `https://<project>.vercel.app/quiz/`

### After deploy

Every push to `main` updates the live site (GitHub Pages within ~1–2 min; Vercel usually faster).

---

## Adding tracks or a new exam

1. Add MP3s under `exam1/` (or a new folder like `exam2/`).
2. Edit `quiz/catalog.json` — each track needs `file`, `title`, and `artist` (title/artist are used for study display on exams 1–2; keep them accurate even when using listed answers).

**Default scoring (exams 1 and 2):** omit `answerMode`. The quiz accepts either `title` or `artist` for each track.

**Exam-sheet-only answers (exam 3 style):** set `"answerMode": "listed"` on the exam object. On each track, set `"answers"` to the exact strings students must know — nothing else counts in quiz or study reveal.

Rules when building `answers`:

- If the sheet lists an **artist** and that artist has **multiple tracks** in the pool, use only the **artist name** in `answers` for each of those tracks (e.g. both Charlie Parker tracks → `["Charlie Parker"]`).
- If the sheet lists a **song title** only, use only that **title** in `answers` (do not add the billed artist unless the sheet also lists them).
- If the sheet lists **both** a title and an artist for one recording (e.g. Venus de Milo and Miles Davis), include **both** strings in `answers` for that track.
- Do not add tracks whose sheet label is not on the exam list. Remove the MP3 if it is not on the sheet.

Example (listed exam):

```json
{
  "id": "exam3",
  "title": "Exam 3",
  "audioDir": "/exam3",
  "answerMode": "listed",
  "tracks": [
    {
      "id": "exam3-41",
      "file": "41. Charlie Parker - Embraceable You.mp3",
      "title": "Embraceable You",
      "artist": "Charlie Parker",
      "answers": ["Charlie Parker"]
    },
    {
      "id": "exam3-43",
      "file": "43. Bud Powell - Tempus Fuge-It.mp3",
      "title": "Tempus Fugue-It",
      "artist": "Bud Powell",
      "answers": ["Tempus Fugue-It"]
    }
  ]
}
```

3. For a new exam set, copy an existing exam object in `catalog.json`, change `id`, `title`, and `audioDir`, and fill in `tracks`.
4. Push. No build step.

Use the same `artist` string when one person appears on multiple tracks on **title-or-artist** exams so quiz scoring treats them as one label.

---

## Project layout

```
quiz/           App (index.html, app.js, styles.css, catalog.json)
exam1/          Audio files for exam 1
exam2/          Audio files for exam 2
exam3/          Audio files for exam 3
index.html      Redirects to /quiz/
.nojekyll       GitHub Pages config
vercel.json     Vercel config
```

---

## Local development (optional)

Only needed when editing the app offline:

```bash
python3 serve.py
# or: ./jazz-quiz   (after go build)
```

Open http://127.0.0.1:8765/quiz/ — do not open `quiz/index.html` directly as a file; the browser blocks audio that way.

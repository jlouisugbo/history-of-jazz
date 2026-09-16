# History of Jazz — listening quiz

A static listening study app: **quiz mode** (60-second excerpts) and **study mode** (full tracks). No backend — just HTML, audio files, and a JSON catalog.

**Live site:** https://jlouisugbo.github.io/history-of-jazz/quiz/

Share that link with anyone in the class. Works in any browser; nothing to install.

---

## Using the app

### Quiz mode
- 10 random excerpts per attempt, 15 answer choices
- Match each excerpt by **song title** or **billed artist** (either counts)
- Shared artists (e.g. Duke Ellington on multiple tracks) are valid for each matching excerpt
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
2. Edit `quiz/catalog.json` — each track needs `file`, `title`, and `artist`:

```json
{
  "id": "exam1-24",
  "file": "24. Artist - Song.mp3",
  "title": "Song Title",
  "artist": "Billed Artist Name"
}
```

3. For a new exam set, copy the `exam1` object in `catalog.json`, change `id`, `title`, and `audioDir` (e.g. `/exam2`), and fill in `tracks`.
4. Push. No build step.

Use the same `artist` string when one person appears on multiple tracks (e.g. `"Duke Ellington"`) so quiz scoring treats them as one label.

---

## Project layout

```
quiz/           App (index.html, app.js, styles.css, catalog.json)
exam1/          Audio files for exam 1
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

# History of Jazz listening quiz

Local quiz + study mode, or **host online** so classmates just open a link (no download, no Smart App Control issues).

## Host online (recommended for sharing)

**Both GitHub Pages and Vercel are free** and easily handle 50+ classmates. Audio is static files; there is no server to scale.

| | GitHub Pages | Vercel |
|---|-------------|--------|
| Cost | Free | Free |
| Bandwidth | ~soft 100 GB/month | 100 GB/month (Hobby) |
| Best if | Repo is already on GitHub | You want auto-deploy on every push |
| Your URL | `https://jlouisugbo.github.io/history-of-jazz/quiz/` | `https://your-project.vercel.app/quiz/` |

50 people listening to ~3 min tracks a few times each is well under either limit.

### Option A — GitHub Pages (simplest)

Repo: [github.com/jlouisugbo/history-of-jazz](https://github.com/jlouisugbo/history-of-jazz)

1. Push this folder to `main` (including `exam1/` MP3s).
2. On GitHub: **Settings → Pages**
3. **Build and deployment → Source:** Deploy from a branch
4. **Branch:** `main` → folder **`/ (root)`** → Save
5. Wait ~1–2 minutes. Open:

   **https://jlouisugbo.github.io/history-of-jazz/quiz/**

Send that link to your friend. Nothing to install.

### Option B — Vercel

1. Push to GitHub (same repo).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `history-of-jazz`.
3. Leave defaults (static site) → **Deploy**.
4. Open `https://<project>.vercel.app/quiz/` (root redirects to `/quiz/`).

---

## Run locally (optional)

```bash
python3 serve.py
# or
./jazz-quiz
```

Open http://127.0.0.1:8765/quiz/

## Modes

**Quiz** — 10 random 60-second excerpts, 15 choices. Match by **title or artist** (2 pts each).

**Study** — full tracks in random order. **Show answer** when ready. Keys: space play, S reveal, N next.

## Add exam 2

1. Drop MP3s in `exam2/`.
2. Copy the `exam1` block in `quiz/catalog.json`; set `id`, `title`, `audioDir` to `/exam2`.
3. Add tracks with `file`, `title`, `artist`. Push — hosting updates automatically.

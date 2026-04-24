# Thesis Structure Organizer

Drag-and-drop outline manager for the EPU / Polymarket thesis.

## Local dev

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: Push to GitHub, connect repo in vercel.com dashboard
git init
git add .
git commit -m "thesis organizer"
git remote add origin <your-repo-url>
git push -u origin main
# Then: vercel.com → New Project → Import from GitHub
```

## How state works

- **Each browser** saves its own state via `localStorage`
- Changes persist across page reloads and browser restarts
- To sync between collaborators: **Export JSON** → send file → **Import JSON**
- The JSON file can also be committed to the repo for version history

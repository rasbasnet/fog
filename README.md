# Museum of Failure — Gallery of Trying

A Vite + React + TypeScript experience for documenting experiments, ambitions, and works-in-progress. The site opens with an atmospheric hero inspired by `fog.jpg`, followed by an interactive timeline that links to detailed rooms for each focus area.

## Getting started

```bash
npm install
npm run dev
```

- Visit `http://localhost:5173` to explore the live timeline.
- `npm run build` produces a production bundle in `dist/` (and drops a `404.html` fallback for GitHub Pages).
- `npm run deploy` publishes the latest build to https://rasbasnet.github.io/fog/ using GitHub Pages.

## Highlights

- Animated hero showcasing the fog imagery with layered gradients and motion.
- Timeline section (Sep 21 2025 → Sep 21 2026) with scroll-activated cards and gradient art direction.
- Dedicated pages for each focus area, including narrative context, milestones, and quick navigation back to the timeline.
- Journey detail pages pull their entries from JSON, so you can log progress updates without touching the UI code.
- Cover art imagery for select journeys is sourced from Unsplash and stored in `public/art/`.

## Project structure

```
src/
├─ App.tsx               # Layout shell, navigation, and router outlet
├─ assets/fog.jpg        # Featured hero imagery
├─ data/journeys.json    # Source of truth for every timeline section + entries
├─ data/journeys.ts      # Typed bridge around the JSON data
├─ data/timeline.ts      # Shared timeline anchors (start & end dates)
├─ pages/
│  ├─ HomePage.tsx       # Hero + interactive timeline
│  ├─ JourneyPage.tsx    # Detail view per focus area
│  └─ NotFoundPage.tsx   # Soft landing for unknown routes
```

Feel free to tune the copy, add new journeys, or expand the visual language—each page reads directly from `src/data/journeys.json`, so updating timelines or adding new rooms is as simple as editing that file.

### Editing timeline data

Each journey object in `journeys.json` accepts an `entries` array. Every entry can include an `entryDate`, `title`, freeform `text`, optional `image` metadata, and layout hints (`columns` / `rows`) that control how wide the card renders on larger screens. Add new entries as progress is made—no code changes required.

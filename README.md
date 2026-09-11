# Interactive Museum of Games

A cinematic, responsive 3D museum homepage inspired by luxury exhibition design and the emotional history of video games.

## Highlights

- Procedural real-time 3D museum built with Three.js (no model downloads required)
- Symmetrical museum hall with glossy floor, warm/cool cinematic lighting and fog
- Six interactive 3D exhibit families: handhelds, arcade machines, home consoles, controllers, game library and iconic displays
- Glass display cases, premium pedestals and a retro portal screen
- Mouse/touch camera parallax, raycast exhibit selection and subtle object motion
- Accessible HTML overlay controls and keyboard navigation
- Search, visit planner, focus dialogs, trailer preview and optional WebAudio ambience
- Responsive desktop/tablet/mobile layout
- `prefers-reduced-motion` support
- GitHub Pages deployment workflow included

## Run locally

Because the site uses ES modules, serve it over HTTP instead of opening the file directly:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Live site

`https://saaeiddev.github.io/Interactive-Museum-of-Games/`

## Structure

- `index.html` — semantic page, UI overlays, dialogs and content
- `styles.css` — responsive premium museum UI
- `app.js` — Three.js scene, interactions, accessibility behavior and animation
- `.github/workflows/pages.yml` — GitHub Pages deployment
- `.nojekyll` — ensures GitHub Pages serves files directly

## Notes

Three.js and Google Fonts are loaded from public CDNs. The museum objects are original procedural geometry rather than copied console or game assets.

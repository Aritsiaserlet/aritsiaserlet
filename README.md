# Aritsia - Pixel Art Portfolio

A pixel-art style portfolio website for a Game Developer / Minecraft Modder / 3D Artist, built with vanilla HTML, CSS, and JavaScript - no framework required.

## Features

- **Portfolio Gallery** - Dynamic card grid with category filtering, sorting, and like system
- **Pixel Minigame** - Play a built-in Elytra dive-attack minigame (`game.html`)
- **Admin Panel** - Full CMS via `admin.html` for managing works, icons, sounds, and site settings
- **Milestone Architecture** - All content (`settings.json`, `works.json`) lives in the same GitHub repo and is fetched via the GitHub Raw API - no backend needed
- **Firebase Auth + Firestore** - Google login for the likes/leaderboard system
- **Custom Audio Engine** - Web Audio API-based sound manager with per-channel volume/mute controls
- **Theme System** - 5 color themes (Blue, Purple, Green, Orange, Red) saved to `localStorage`
- **3D Model Viewer** - Embedded Three.js GLB model viewer for 3D work entries

## Project Structure

```
aritsiaserlet/
├── index.html          # Main portfolio page
├── admin.html          # Admin CMS panel (password-protected)
├── game.html           # Minigame page
├── game.js             # Minigame engine (Canvas 2D, standalone)
├── audioManager.js     # Web Audio API sound manager (ES module)
├── authManager.js      # Firebase Auth + Firestore abstraction (ES module)
├── settingsManager.js  # localStorage settings + CSS theme manager (ES module)
├── css/
│   ├── index.css       # Main portfolio styles
│   ├── admin.css       # Admin panel styles
│   └── game.css        # Game page styles
├── js/
│   ├── index.js        # Main portfolio logic (gallery, filters, modal, particles)
│   ├── admin.js        # Admin panel logic (GitHub API CRUD, uploads)
│   └── game-lobby.js   # Game lobby / settings modal JS
├── settings.json       # Site config (categories, sounds, social links, etc.)
└── works.json          # Portfolio works data (fetched via GitHub Raw API)
```

## Setup

Since this project uses the GitHub Raw API as its "backend", you just need to:

1. **Fork or clone** this repository to your own GitHub account.
2. **Update the GitHub constants** in `authManager.js`, `audioManager.js`, and `js/admin.js` to point to your own username/repo:
   ```js
   const GH_USER = 'YourGitHubUsername';
   const GH_REPO = 'your-repo-name';
   ```
3. **Set up Firebase** (for the like system):
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Google Authentication and Firestore
   - Replace the `firebaseConfig` object in `authManager.js` with your own config
4. **Enable GitHub Pages** on your repository (Settings → Pages → Deploy from `main` branch)
5. Visit your site at `https://yourusername.github.io/your-repo-name/`

## Admin Panel

The admin panel is accessible from the Settings modal (Settings button) on the main page:

1. Enter the admin password (default: `****` — **change this in `js/index.js`** before going public)
2. Enter a GitHub Personal Access Token (PAT) with `repo` scope
3. Click **Enter Admin Panel**

From the admin panel you can:
- Add, edit, and delete portfolio works
- Upload and manage icons, team members, and sounds
- Configure site settings (avatar, background, social links, categories)

## Security Notes

> **Important:** This portfolio exposes admin access via a hardcoded password and a GitHub PAT entered at runtime. This is suitable for a personal portfolio where you are the only admin. **Do not commit your GitHub token to the repository.**

- The admin password is in `js/index.js` — change `'****'` to something secure
- The GitHub token is stored in `sessionStorage` only (cleared on tab close)
- Firebase config is public by design (Firebase security rules control data access)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, Vanilla JS |
| Auth & DB | Firebase v10 (Auth + Firestore) |
| Storage | GitHub Repository (Raw API) |
| 3D Viewer | Three.js r128 |
| Fonts | Google Fonts (Press Start 2P, VT323) |

## License

© 2026 AritsiaZ. Licensed under the MIT License.

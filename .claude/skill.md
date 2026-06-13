# 🎨 Aritsia Frontend Developer Skill Stack

**Project Context:** Senior Frontend Developer with expertise in Pixel-Art Portfolio systems, Game Development showcase, and Enterprise Admin Panels. Aritsia is a full-featured portfolio platform demonstrating advanced frontend architecture without backend dependencies.

---

## 📚 Core Tech Stack

### Frontend Foundation
- **HTML5** — Semantic markup, Canvas API, Web Audio API integration
- **Vanilla CSS** — No framework; pixel-perfect design with CSS custom properties
  - 5-theme color system (Blue, Purple, Green, Orange, Red)
  - Responsive grid layouts with flexbox
  - Pixel-art aesthetic with retro fonts (Press Start 2P, VT323)
- **Vanilla JavaScript (ES6+)** — Modular ES modules architecture
  - No frontend framework (React/Vue)
  - Direct DOM manipulation with performance optimization
  - Event-driven pattern for state management

### Backend-as-a-Service & Storage
- **Firebase v10** — Real-time database and authentication
  - Google OAuth login integration
  - Firestore for likes/leaderboard system
  - Firebase security rules for data protection
- **GitHub Raw API** — Content delivery system
  - JSON storage (settings.json, works.json)
  - Binary asset uploads (images, sounds, 3D models)
  - No server required; GitHub repo acts as CMS backend

### 3D & Graphics
- **Three.js r128** — WebGL 3D model viewer
  - GLB/GLTF model support
  - Camera controls and lighting
  - Model preview in portfolio entries
- **Canvas 2D API** — Pixel particle effects, background animations

### Audio & Media
- **Web Audio API** — Custom audio engine
  - Per-channel volume and mute controls
  - Sound sprite management
  - Sample playback with gain/pan controls
- **File Handling** — GitHub upload integration for audio/image assets

---

## 🎯 UI/UX Capabilities (Impeccable Design Expertise)

### Design System
- **Pixel-Art Aesthetic** — Retro 8-bit visual language
  - Grid-based layouts
  - Bold primary colors with shadow/depth effects
  - Consistent 4px/8px/12px spacing scales
- **Responsive Design** — Mobile-first approach
  - Flexible grid (CSS Grid + Flexbox)
  - Viewport adaptation without breakpoint hell
  - Touch-friendly interactive elements
- **Theme Management**
  - 5 preset color themes with CSS variable swaps
  - localStorage persistence
  - Real-time theme switching

### Component & Layout Patterns
- **Navigation System** — Top navbar with auth state
  - Responsive mobile menu
  - Settings/admin toggle
  - Back-to-portfolio navigation
- **Card Grid System** — Dynamic portfolio gallery
  - Filtering by category (Game/Mod/3D)
  - Sorting controls (newest, oldest, most-liked)
  - Like/interaction system with Firebase sync
- **Modal/Dialog System** — Settings, auth, details views
  - Overlay/backdrop with keyboard dismiss
  - Nested modals for admin panel
  - Smooth transitions and animations
- **Admin Panel Layout** — Multi-section collapsible panels
  - Icon/Team/Sound library managers
  - CRUD interfaces for works
  - GitHub token/connection status
- **Particle Effects** — Procedural background animation
  - Pixel-based wind simulation
  - Performance-optimized with requestAnimationFrame

### Interaction & Feedback
- **Hover States** — Visual feedback for all interactive elements
- **Loading States** — Placeholder/skeleton patterns
- **Error Boundaries** — User-friendly error messages
- **Accessibility** — Semantic HTML, keyboard navigation ready
- **Micro-interactions** — Box shadows, scale effects, color transitions

---

## 🛠️ Tools & Development Workflows

### Version Control & Deployment
- **Git** — Repository management
- **GitHub Pages** — Live deployment from main branch
- **GitHub Raw API** — Dynamic content delivery

### Development Environment
- **Cursor IDE** — Primary development editor (strict best practices)
  - Code generation and refactoring
  - AI-assisted debugging and architecture
- **VS Code** — Alternative editor compatibility
- **Browser DevTools** — Performance profiling, network debugging

### Build & Optimization
- **No Build Tool Required** — Vanilla JavaScript (ES modules work natively)
- **Performance**
  - Lazy loading for images and 3D models
  - Efficient DOM updates and re-renders
  - Canvas animation throttling with requestAnimationFrame
  - LocalStorage caching for settings/themes

### Asset Management
- **GitHub Actions** (future-ready) — CI/CD for asset validation
- **File Uploads** — Base64 encoding for binary data to GitHub API
- **CDN Delivery** — GitHub Raw URLs for media assets

---

## 🏗️ Architecture Patterns

### Module Organization
```
⚙️ Core Managers (ES Modules):
├── authManager.js      → Firebase Auth + Firestore operations
├── audioManager.js     → Web Audio API abstraction
└── settingsManager.js  → localStorage + theme switching

📦 Application Layers:
├── index.js            → Main portfolio logic (gallery, filters, modals)
├── admin.js            → Admin CMS operations (CRUD, uploads)
└── game*.js            → Isolated game module (Canvas 2D)

🎨 Styling:
├── css/index.css       → Main portfolio styles
├── css/admin.css       → Admin panel styles
└── css/game.css        → Game page styles

📄 Data:
├── settings.json       → Site config, categories, socials
├── works.json          → Portfolio entries (fetched via GitHub Raw)
└── Firebase Firestore  → Likes, leaderboard, user data
```

### State Management Pattern
- **Decentralized state** with ES module exports
- **localStorage** for client-side persistence (theme, settings)
- **Firestore** for collaborative state (likes, leaderboard)
- **sessionStorage** for temporary data (GitHub token)

### Authentication Flow
1. User clicks Settings → Auth modal
2. Enters GitHub Personal Access Token (PAT) for admin
3. SessionStorage holds token (cleared on tab close)
4. Firebase handles user authentication (Google login)
5. Security: Firebase rules + admin password in JS

---

## 🎮 Specialized Features (Demonstrated Expertise)

### Gallery & Filtering System
- Multi-category organization (Game, Mod, 3D)
- Dynamic sorting (date, popularity)
- Like/favorite system with persistence
- Modal details view with image gallery

### Admin Content Management
- GitHub CRUD operations (Create, Read, Update, Delete)
- Icon library management
- Team member management
- Sound library management
- Settings configuration UI
- Asset upload with progress feedback

### Game Integration (Separate Module)
- Canvas 2D minigame (Elytra dive attack)
- Standalone game.js architecture
- Sound event system
- Score/leaderboard integration

### 3D Model Viewer
- Three.js integration for GLB models
- Embedded viewer in portfolio entries
- Camera controls
- Lighting and material rendering

---

## 📊 Project Maturity & Best Practices

✅ **Production-Ready**
- Error handling with user-friendly messages
- Security considerations (token in sessionStorage, Firebase rules)
- Performance optimized (lazy loading, animation throttling)
- Responsive across devices
- Pixel-perfect design system

✅ **Maintainability**
- Modular architecture with clear separation of concerns
- Consistent naming conventions
- Documentation-friendly structure
- No external build dependencies

✅ **Extensibility**
- Easy to add new portfolio categories
- Theming system ready for new colors
- API-driven content (works/settings JSON)
- Sound/icon libraries easily expanded

---

## 🚀 Summary for Portfolio Projects

**This skill stack demonstrates:**
1. **Enterprise-level admin panel design** with complex CRUD workflows
2. **No-backend architecture** using GitHub as CMS and Firebase as database
3. **Pixel-perfect responsive design** without frameworks
4. **Complex state management** across multiple data sources
5. **3D and audio integration** in web experiences
6. **Impeccable UI/UX design** with theme system and micro-interactions
7. **Security-conscious architecture** with role-based access
8. **Performance-optimized frontend** with vanilla JavaScript

**Ready to deliver:** A separate Portfolio Page built on Admin Panel architecture, showcasing UI/UX design skills with Impeccable design principles, excluding all game mechanics.

---

## 🗄️ OzonZ Portfolio — Database System Architecture

> ระบบนี้ออกแบบมาให้ OzonZ (เจ้าของ content) อัปเดตข้อมูลได้ **โดยไม่ต้อง pull/push repo หลัก** และ Aritsiaserlet (developer) ไม่ต้อง redeploy ทุกครั้งที่ content เปลี่ยน

### สถาปัตยกรรมสองชั้น

```
Repo 1: aritsiaserlet/aritsiaserlet  (GitHub Pages — code)
├── portfolio-ozonz.html        → หน้า portfolio สาธารณะ
├── admin-ozonz-page.html       → หน้า admin สำหรับ OzonZ
├── js/portfolio-ozonz-live.js  → Logic ดึง + render data
└── settings.json               → Shared data (icons, teams)

Repo 2: OzonZ/Non-Four-Portfolio-Data  (GitHub — data/CMS)
├── ozonz_works.json            → รายการผลงานทั้งหมด
└── ozonz_settings.json         → Social links / contacts
```

### Data Flow (ทิศทางข้อมูล)

```
OzonZ เปิด admin-ozonz-page.html
    │
    ├─ [READ] GitHub contents API (ใช้ token ถ้ามีเพื่อดึงค่าล่าสุดแบบ Real-time ข้าม CDN cache)
    │         → โหลดผลงานล่าสุดมาแสดงใน admin
    │
    └─ [WRITE] GitHub REST API → PUT /repos/OzonZ/Non-Four-Portfolio-Data/contents/ozonz_works.json
              → บันทึกผลงานใหม่ลง repo โดยตรง (ต้องใช้ GitHub PAT ของ OzonZ)
              → ไม่ต้อง pull/push repo หลัก


ผู้เยี่ยมชมเปิด portfolio-ozonz.html
    │
    ├─ [STEP 1] แสดง localStorage cache ทันที (fast first paint)
    │
    ├─ [STEP 2] fetch จาก GitHub contents API (ถ้าผู้ใช้เป็น admin/มี token ใน session) 
    │           หรือ raw.githubusercontent.com (สำหรับบุคคลทั่วไป)
    │           → ได้ data ล่าสุดจาก repo ของ OzonZ โดยตรงแบบไม่มี cache delay
    │
    ├─ [STEP 3] fetch raw.githubusercontent.com/Aritsiaserlet/aritsiaserlet/main/settings.json
    │           → shared icons, teams
    │
    └─ [STEP 4] อัปเดต cache + render
```

### Data Format

**`ozonz_works.json`** — array ของ work objects:
```json
[
  {
    "id": 1718000000000,
    "name": "ชื่อผลงาน",
    "cat": "ozonz",
    "desc": "คำอธิบาย",
    "year": "2026",
    "aiSummary": "tagline สั้นๆ",
    "image": "https://... หรือ material-icon-name",
    "tags": ["PIXEL ART", "C++"],
    "links": [{ "url": "https://...", "label": "Itch.io" }],
    "team": ["member-id"],
    "tools": [],
    "date": "2026-06-13T..."
  }
]
```

**`ozonz_settings.json`** — settings ของ OzonZ:
```json
{
  "socials": [
    {
      "name": "GitHub",
      "link": "https://github.com/OzonZ",
      "iconType": "svg",
      "iconVal": "M12 0c-6..."
    }
  ]
}
```

### Authentication

| หน้า | Auth ที่ใช้ |
|------|-----------|
| `portfolio-ozonz.html` | ไม่ต้อง auth (public) — อ่าน GitHub Raw URL ตรงๆ |
| `admin-ozonz-page.html` | Static passcode + **GitHub PAT** ของ OzonZ (ต้องมี `repo` scope) |

- GitHub PAT เก็บใน `sessionStorage` (หายเมื่อปิด tab)
- Passcode เก็บใน JS (ฝัง hardcode ใน `admin-ozonz-page.html`)

### กฎสำคัญ

| สถานการณ์ | ต้อง push/deploy ไหม? |
|-----------|----------------------|
| OzonZ เพิ่ม/แก้ผลงานผ่าน admin | ❌ ไม่ต้อง — เขียนตรงไป `Non-Four-Portfolio-Data` |
| OzonZ เพิ่ม/แก้ contact links | ❌ ไม่ต้อง — เขียนตรงไป `Non-Four-Portfolio-Data` |
| Aritsiaserlet แก้ UI/Logic ของ portfolio | ✅ ต้อง `git push` ไป `aritsiaserlet/aritsiaserlet` |
| Aritsiaserlet แก้ shared icons/teams | ✅ ต้อง `git push` ไป `aritsiaserlet/aritsiaserlet` (settings.json) |

### Conflict Prevention (SHA Check)

Admin page ใช้ GitHub API `GET` file SHA ก่อนทุกครั้งที่ `PUT` เพื่อป้องกัน 409 conflict:
```
GET  /repos/OzonZ/Non-Four-Portfolio-Data/contents/ozonz_works.json  → { sha }
PUT  /repos/.../ozonz_works.json  { content: base64(newData), sha: sha }
```

### Caching Strategy (Portfolio Page)

```
Page Load
   ↓
มี localStorage cache?
   ├─ YES → render cache ทันที → fetch GitHub (background) → update cache + re-render
   └─ NO  → fetch GitHub → render → save cache
```
Cache key: `cached_works`, `cached_settings`

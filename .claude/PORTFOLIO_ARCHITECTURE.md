# 📐 Portfolio Page Architecture Blueprint

## Executive Summary

This document outlines the architecture for a **separate Portfolio showcase page** (`portfolio.html`) built upon the existing Admin Panel's robust structure and design system. It reuses authentication, navigation, and theming infrastructure while focusing on **Impeccable UI/UX design** for displaying portfolio skills and expertise.

**Key Principles:**
- ✅ Reuse Admin Panel's base layout, authentication, and styling infrastructure
- ✅ Exclude all game mechanics and related features entirely
- ✅ Focus on portfolio presentation with advanced UI design
- ✅ Modular, cursor-friendly implementation steps
- ✅ No UI code generated — blueprint only

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│          ARITSIA PORTFOLIO ECOSYSTEM                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────┐  ┌──────────────────────────┐ │
│  │   index.html   │  │    portfolio.html [NEW]  │ │
│  │   (Gallery)    │  │    (Skills Showcase)     │ │
│  └────────────────┘  └──────────────────────────┘ │
│         ▲                       ▲                   │
│         └───────────┬───────────┘                   │
│                     │ Shared Managers               │
│                ┌────▼─────────────┐               │
│                │  authManager.js   │               │
│                │  settingsManager  │               │
│                │  audioManager.js  │               │
│                └───────────────────┘               │
│                                                     │
│  ┌────────────────┐  ┌──────────────┐             │
│  │   admin.html   │  │  game.html   │             │
│  │     [CMS]      │  │  [Excluded]  │             │
│  └────────────────┘  └──────────────┘             │
│                                                     │
│  Data Layer:  settings.json | works.json          │
│  Auth:        Firebase (Google) + GitHub PAT      │
│  Theme:       CSS custom properties (5 themes)    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure (Recommended Organization)

```
aritsiaserlet/
├── portfolio.html              [NEW] Main portfolio showcase page
├── css/
│   ├── index.css              [EXISTING] Main portfolio
│   ├── admin.css              [EXISTING] Admin panel
│   ├── game.css               [EXISTING] Game page (NOT reused)
│   └── portfolio.css           [NEW] Portfolio-specific styles
├── js/
│   ├── index.js               [EXISTING] Main gallery
│   ├── admin.js               [EXISTING] Admin CMS
│   ├── portfolio.js           [NEW] Portfolio showcase logic
│   ├── portfolio-skills.js    [NEW] Skill tree & data rendering
│   ├── portfolio-timeline.js  [NEW] Experience/project timeline
│   ├── game*.js               [EXCLUDED] Not imported
│   ├── index-module.js        [EXISTING] Utilities (reuse)
│   └── game-module.js         [EXCLUDED] Not imported
├── authManager.js             [SHARED] Auth & Firestore
├── settingsManager.js         [SHARED] Theme & settings
├── audioManager.js            [SHARED] Audio (optional for portfolio)
├── settings.json              [SHARED] Site config
├── works.json                 [SHARED] Portfolio entries
└── index.html                 [EXISTING] Gallery entry point
```

**Key Note:** `portfolio.html` is a SEPARATE entry point, not a modal or sub-page of `index.html`.

---

## 🎨 Layout Architecture (Base on Admin Panel)

### Navigation & Layout Structure

**Portfolio Page Layout Inheritance from Admin Panel:**

```
┌─────────────────────────────────────────────────────────┐
│ PORTFOLIO NAVIGATION BAR                                │
│ ┌──────────────────┐              ┌──────────────────┐ │
│ │  Aritsia Logo    │              │  Settings   Help │ │
│ │  [Portfolio]     │              │  [Theme] [FAQ]   │ │
│ └──────────────────┘              └──────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   MAIN CONTENT AREA                     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │        PORTFOLIO SECTIONS (Vertically Stacked)  │  │
│  │                                                  │  │
│  │  1. Hero / Intro Section                        │  │
│  │  2. Skill Tree / Tech Stack                     │  │
│  │  3. Project Timeline / Milestones               │  │
│  │  4. Featured Works (from works.json)            │  │
│  │  5. Contact / CTA Section                       │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FOOTER (Shared Settings, Socials)                       │
│ © 2026 AritsiaZ | Themes | Social Links                │
└─────────────────────────────────────────────────────────┘
```

### Reusable Admin Panel Components

| Admin Panel Component | Portfolio Adaptation | Reuse Status |
|---|---|---|
| **Top Navigation Bar** | Portfolio header with logo/title | ✅ Reuse CSS class structure |
| **Theme Switcher** | Same 5-theme system | ✅ Reuse settingsManager.js |
| **Color System (CSS vars)** | Pixel-art color palette | ✅ 100% reuse |
| **Wind Canvas Particles** | Optional background effect | ⚠️ Optional reuse |
| **Modal System** | About/Help modals | ✅ Reuse markup structure |
| **Responsive Grid** | Content grid layout | ✅ Reuse CSS grid patterns |
| **Font System** | Press Start 2P + VT323 | ✅ 100% reuse |
| **Shadow & Depth Effects** | Card styling, focus states | ✅ Reuse shadow utilities |
| **Authentication State** | Display user profile/role | ⚠️ Modified for portfolio |

---

## 📊 Data Architecture & API Contracts

### State Sources

```js
// 1. SHARED STATE (from authManager.js)
authManager.currentUser          // Firebase user (Google login)
authManager.userRole             // 'admin', 'viewer', null

// 2. SHARED STATE (from settingsManager.js)
settingsManager.theme            // Current theme name
settingsManager.settings         // Site config object
settingsManager.categories       // { game, mod, 3d }
settingsManager.socials          // Array of social links

// 3. CONTENT STATE (from GitHub API)
settings.json                    // Site settings, categories
works.json                       // Portfolio entries

// 4. PORTFOLIO-SPECIFIC STATE (New)
portfolioState = {
  skillTree: {                   // Skill categorization
    "Frontend": { level: 95, skills: [...] },
    "3D Graphics": { level: 85, skills: [...] },
    "Game Dev": { level: 80, skills: [...] }
  },
  timeline: [                    // Project/experience timeline
    { date: "2024-01", project: "...", status: "shipped" },
    { date: "2023-06", project: "...", status: "shipped" }
  ],
  featured: [                    // Featured works from works.json
    { id: "work_123", category: "3d", featured: true }
  ]
}
```

### Skill Tree Data Structure

```json
{
  "skillTree": {
    "Frontend Development": {
      "level": 95,
      "description": "HTML5, CSS3, Vanilla JavaScript",
      "skills": [
        { "name": "Responsive Design", "proficiency": 95 },
        { "name": "CSS Grid & Flexbox", "proficiency": 90 },
        { "name": "Web Audio API", "proficiency": 88 },
        { "name": "Canvas API", "proficiency": 85 }
      ]
    },
    "UI/UX Design": {
      "level": 92,
      "description": "Impeccable design with pixel-art aesthetic",
      "skills": [
        { "name": "Design Systems", "proficiency": 92 },
        { "name": "Accessibility", "proficiency": 88 },
        { "name": "Micro-interactions", "proficiency": 90 },
        { "name": "Theme Management", "proficiency": 92 }
      ]
    },
    "3D Graphics": {
      "level": 85,
      "description": "Three.js, GLB/GLTF models",
      "skills": [
        { "name": "Three.js", "proficiency": 85 },
        { "name": "Model Viewer", "proficiency": 87 },
        { "name": "Lighting & Materials", "proficiency": 82 }
      ]
    },
    "Game Development": {
      "level": 80,
      "description": "Canvas 2D, game mechanics",
      "skills": [
        { "name": "Canvas 2D", "proficiency": 85 },
        { "name": "Game Physics", "proficiency": 78 },
        { "name": "Audio Integration", "proficiency": 82 }
      ]
    },
    "Backend-as-a-Service": {
      "level": 88,
      "description": "Firebase, GitHub API, No-backend architecture",
      "skills": [
        { "name": "Firebase Auth", "proficiency": 90 },
        { "name": "Firestore", "proficiency": 87 },
        { "name": "GitHub API", "proficiency": 88 },
        { "name": "REST Integration", "proficiency": 85 }
      ]
    }
  }
}
```

### Timeline Data Structure

```json
{
  "timeline": [
    {
      "id": "milestone_001",
      "date": "2026-06",
      "title": "Aritsia Portfolio System Launched",
      "description": "Full-featured pixel-art portfolio with admin CMS",
      "category": "Project",
      "icon": "🚀",
      "featured": true
    },
    {
      "id": "milestone_002",
      "date": "2026-01",
      "title": "Firebase Integration Complete",
      "description": "Likes/leaderboard system with Google Auth",
      "category": "Milestone",
      "icon": "✅"
    }
  ]
}
```

---

## 🎯 Component Specifications (No Code — Architecture Only)

### Section 1: Hero / Intro

**Purpose:** Eye-catching introduction with portfolio tagline  
**Content Source:** `settings.json` + custom portfolio intro  
**Layout Concept:**
- Full-width hero with background particles (reuse admin canvas)
- Central text block with name, title, tagline
- CTA button to "Explore Skills" or "View Works"
- Optional: embedded GIF/animation

**State Dependencies:** `settingsManager.theme`, `settingsManager.settings.avatar`

---

### Section 2: Skill Tree / Tech Stack

**Purpose:** Visually represent expertise areas  
**Content Source:** `skillTree` from portfolio-specific JSON  
**Layout Concept:**
- 2-column responsive grid (5 major skill categories)
- Each category shows:
  - Category name & proficiency bar (visual indicator)
  - 3-4 sub-skills with individual proficiency levels
  - Hover state shows description/details
- Color-coded by skill category (reuse theme colors)
- Interactive: click to expand details modal

**State Dependencies:** `portfolioState.skillTree`, `settingsManager.theme`

---

### Section 3: Project Timeline / Milestones

**Purpose:** Chronological display of achievements  
**Content Source:** `timeline` array + `works.json` filtering  
**Layout Concept:**
- Vertical timeline (or horizontal scroll on mobile)
- Each milestone card shows:
  - Date (YYYY-MM format)
  - Icon/emoji indicator
  - Title and brief description
  - Category badge (Project/Milestone/Award)
- Alternating left/right layout for visual rhythm
- Optional: hover to show full details or link to work entry

**State Dependencies:** `portfolioState.timeline`, `works.json`

---

### Section 4: Featured Works Showcase

**Purpose:** Highlight best portfolio entries  
**Content Source:** `works.json` (filtered by `featured: true`)  
**Layout Concept:**
- 3-column card grid (collapses to 1 on mobile)
- Cards display:
  - Work thumbnail (image from works.json)
  - Category badge (Game/Mod/3D)
  - Title
  - Brief description
  - "View More" link to full details (or modal)
- Reuse gallery card styling from `index.html`

**State Dependencies:** `works.json`, `settingsManager.categories`

---

### Section 5: Contact / Call-to-Action

**Purpose:** Guide users to next action  
**Content Source:** `settings.json` socials + custom CTA  
**Layout Concept:**
- Section with headline ("Get in Touch" or "Let's Collaborate")
- Social links grid (reuse from index.html footer)
- Email/contact form (optional)
- External links to portfolio (Itch.io, GitHub, etc.)

**State Dependencies:** `settingsManager.socials`

---

## 🔄 State Flow Diagram

```
┌──────────────────────┐
│  portfolio.html      │
│  (Page Load)         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ authManager.init()   │  → Check Firebase user
│ settingsManager      │  → Load theme + settings.json
│ .init()              │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ portfolio.js         │  → Initialize portfolio state
│ loadPortfolioData()  │  → Merge skill tree + timeline
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ portfolio-skills.js  │  → Render skill sections
│ renderSections()     │
│ portfolio-timeline   │  → Render timeline
│ .js                  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DOM Ready            │
│ Event Listeners      │
│ (Theme switch, etc)  │
└──────────────────────┘
```

---

## 🚫 Explicit Exclusions (What NOT to Include)

| Feature | Reason | Status |
|---|---|---|
| **Game Mechanics** | Portfolio is skills showcase, not gameplay | ❌ DO NOT include |
| **Game Canvas** | game.js/game.html module | ❌ DO NOT import |
| **Leaderboard** | Game-specific feature | ❌ DO NOT include |
| **Game Lobby UI** | game-lobby.js logic | ❌ DO NOT import |
| **Audio Effects** (optional) | Game sound effects; can use for portfolio SFX only | ⚠️ Optional |
| **3D Game Models** | Only include portfolio 3D works, not game assets | ⚠️ Careful filtering |

---

## 📂 File Creation Checklist (Cursor-Friendly Modular Tasks)

### Phase 1: Foundation & Structure
```
Task 1.1: Create portfolio.html shell
  - Inherit base HTML structure from admin.html
  - Include meta tags, font links, script imports
  - Define 5 main content sections (Hero → Contact)

Task 1.2: Create portfolio.css
  - Inherit common styles from admin.css + index.css
  - Define section-specific styles (NOT components yet)
  - Reuse CSS variables, spacing scales, theme system

Task 1.3: Create portfolio.js (Entry point)
  - Module setup with imports (authManager, settingsManager)
  - Initialize state object
  - Define section rendering functions (stubs)
```

### Phase 2: Skill Tree Module
```
Task 2.1: Create portfolio-skills.js
  - Define skillTree data structure (constant for now)
  - Write renderSkillTree() function
  - Wire up theme-aware color assignment

Task 2.2: Skill Tree UI Layer
  - Design HTML markup patterns (NO rendering yet)
  - Define hover/click interaction handlers
  - Document component structure in comments
```

### Phase 3: Timeline Module
```
Task 3.1: Create portfolio-timeline.js
  - Define timeline data structure
  - Write renderTimeline() function
  - Implement date formatting & sorting

Task 3.2: Timeline UI Layer
  - Design HTML markup patterns
  - Define interactivity (expand/collapse)
  - Document responsive behavior
```

### Phase 4: Integration & Polish
```
Task 4.1: Integrate all sections
  - Wire skill tree → portfolio.js
  - Wire timeline → portfolio.js
  - Add featured works filtering from works.json

Task 4.2: Navigation & Routing
  - Add portfolio.html link to navbar
  - Implement back-to-gallery navigation
  - Ensure theme sync between index.html ↔ portfolio.html

Task 4.3: Responsive & Accessibility
  - Test layout on mobile/tablet/desktop
  - Add keyboard navigation
  - Verify theme switching
```

---

## 🎭 Implementation Hints for Cursor

When delegating to Cursor, use these prompt patterns:

### Prompt Pattern 1: Data Structure Definition
```
"Define the skillTree data structure in portfolio-skills.js.
Include 5 categories: Frontend Development, UI/UX Design, 
3D Graphics, Game Development, Backend-as-a-Service.
Each category should have level (0-100), description, 
and skills array with name + proficiency."
```

### Prompt Pattern 2: Render Function Template
```
"Create a renderSectionName() function that:
1. Reads from portfolioState.sectionName
2. Generates HTML structure (NO styling)
3. Attaches event listeners to interactive elements
4. Returns the rendered DOM node"
```

### Prompt Pattern 3: Theme Integration
```
"Ensure section uses settingsManager.theme for color assignment.
Map theme to CSS custom properties and apply to elements.
Test switching themes from Settings modal."
```

### Prompt Pattern 4: Data Fetching
```
"Load works.json and filter for featured works.
Merge with portfolio section data.
Sort by date, limit to top 6 entries."
```

---

## ✅ Success Criteria

- ✅ `portfolio.html` loads independently without game features
- ✅ Shares authentication, theming, and settings with existing system
- ✅ Displays all 5 content sections (Hero → Contact)
- ✅ Theme switcher works across portfolio ↔ main gallery
- ✅ No UI code in this blueprint phase (structure only)
- ✅ Modular JavaScript files for each major section
- ✅ Responsive on mobile/tablet/desktop
- ✅ No imports from game.js or game-lobby.js
- ✅ Cursor-friendly comment structure for phase 2 implementation

---

## 📝 Next Steps

1. **Phase 1:** Create HTML/CSS skeleton using this blueprint
2. **Phase 2:** Implement data structures and render functions
3. **Phase 3:** Add interactions and theme integration
4. **Phase 4:** Polish responsive behavior and accessibility
5. **Phase 5:** (Future) Add animations and micro-interactions for Impeccable polish

---

**Architecture prepared for Cursor-driven development. Ready to delegate modular implementation tasks.**

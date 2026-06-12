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

---

# 🎨 OZONZ PORTFOLIO ARCHITECTURE (Independent Workspace)

> **⚠️ SACRED SPACE:** This section is completely independent from Aritsia's architecture above. Aritsia's design system, code, and structures remain **untouched and unmodified**. OzonZ's workspace operates as a separate, parallel portfolio system within the shared project space.

## Executive Summary

This document outlines the architecture for **OzonZ's dedicated Portfolio system** (`portfolio-ozonz.html`), a completely independent showcase featuring a **gorgeous, atmospheric modern cinematic pixel-art aesthetic inspired by "Until Then"**. 

**OzonZ Identity:**
- **Name:** Chanon Thongduang
- **Handle:** OzonZ
- **Disciplines:** Game Developer, 2D Artist, Programmer (Coding), Game Designer

**Key Principles:**
- ✅ **Separate from Aritsia** — Independent HTML/CSS/JS files, zero conflicts
- ✅ **Until Then Aesthetic** — Lush lighting, gradients, colorful, atmospheric, cinematic
- ✅ **Multi-Discipline Showcase** — Design, Art, Code organized as interconnected disciplines
- ✅ **Professor-Friendly Scanning** — Information structured for quick comprehension by academics/evaluators
- ✅ **Functional Parity** — Same capabilities as Aritsia's system but different visual language
- ✅ **Clean & Readable** — High contrast, beautiful typography, zero clutter

---

## 🎭 Visual Design Language: "Until Then" Aesthetic

### Color Theory
- **Primary Palette:** Warm, saturated colors (peachy golds, soft corals, lilac purples, mint greens)
- **Lighting:** Soft gradients simulating warm interior lighting (golden hour atmosphere)
- **Shadows:** Soft, diffused (not hard-edged like Aritsia's voxel style)
- **Typography:** Modern, rounded sans-serif with elegant serifs for accents
- **Texture:** Smooth, soft edges; hand-drawn feel at pixel level (anti-aliased curves)

### UI Components Philosophy
- **Soft Depth:** Shadow layers using opacity & blur (not hard border outlines)
- **Organic Shapes:** Rounded corners, flowing layouts
- **Atmospheric Feedback:** Gentle glow effects on hover/interaction
- **Breathing Space:** Generous padding & margins for visual rest
- **Cinematic Frames:** Cards with subtle vignette edges, framing content beautifully

### Contrast with Aritsia
| Aspect | Aritsia (Pixel-Perfect) | OzonZ (Cinematic) |
|--------|---|---|
| **Borders** | Hard 4px black outlines | Soft shadows & glows |
| **Corners** | Sharp 90° angles | Rounded smooth arcs |
| **Colors** | Bold primary + 4 alternates | Warm gradient palette |
| **Typography** | Press Start 2P (retro) | Modern rounded sans-serif |
| **Depth** | Flat layering | Soft light/shadow depth |
| **Aesthetic** | Retro voxel/Minecraft | Modern cinematic pixel |

---

## 🏗️ System Architecture Overview

```
┌────────────────────────────────────────────────────┐
│      OZONZ PORTFOLIO INDEPENDENT ECOSYSTEM         │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────┐  ┌────────────────────────┐ │
│  │  index.html      │  │portfolio-ozonz.html[N]│ │
│  │  (Main Gallery)  │  │  (OzonZ Showcase)     │ │
│  └──────────────────┘  └────────────────────────┘ │
│         ▲                        ▲                 │
│         └──────────┬─────────────┘                 │
│                    │ Shared Managers              │
│           ┌────────▼──────────────┐              │
│           │ authManager.js        │              │
│           │ settingsManager.js    │              │
│           │ audioManager.js       │              │
│           └───────────────────────┘              │
│                                                    │
│  ┌────────────────┐  ┌────────────────┐          │
│  │  admin.html    │  │  game.html     │          │
│  │   [CMS]        │  │  [Excluded]    │          │
│  └────────────────┘  └────────────────┘          │
│                                                    │
│  OzonZ-Specific Data:                            │
│  ├─ ozonz-works.json (Art, Design, Code)         │
│  ├─ ozonz-disciplines.json                       │
│  └─ ozonz-profile.json                           │
│                                                    │
│  Shared: settings.json | Firebase | GitHub API   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure (OzonZ Workspace)

```
aritsiaserlet/
├── portfolio-ozonz.html           [NEW] OzonZ main showcase
├── css/
│   ├── index.css                 (EXISTING) Main gallery
│   ├── admin.css                 (EXISTING) Admin panel
│   ├── portfolio.css             (EXISTING) Aritsia portfolio
│   └── portfolio-ozonz.css       [NEW] OzonZ cinematic styles
├── js/
│   ├── portfolio.js              (EXISTING) Aritsia manager
│   ├── portfolio-skills.js       (EXISTING) Aritsia skills
│   ├── portfolio-timeline.js     (EXISTING) Aritsia timeline
│   ├── portfolio-ozonz.js        [NEW] OzonZ entry point
│   ├── ozonz-disciplines.js      [NEW] Multi-discipline data
│   └── ozonz-projects.js         [NEW] Art/Design/Code projects
├── data/
│   ├── ozonz-profile.json        [NEW] OzonZ identity & intro
│   ├── ozonz-disciplines.json    [NEW] 4 discipline breakdown
│   └── ozonz-works.json          [NEW] Art/Design/Code projects
├── authManager.js                (SHARED)
├── settingsManager.js            (SHARED)
├── settings.json                 (SHARED)
├── works.json                    (SHARED)
└── index.html                    (EXISTING)
```

---

## 🎯 Information Architecture: Multi-Discipline Showcase

### Page Structure (5 Sections)

#### **Section 1: Hero / Personal Introduction**
**Purpose:** Establish OzonZ's identity and multi-disciplinary nature  
**Content Elements:**
- OzonZ handle with atmospheric glow effect
- "Game Developer | 2D Artist | Programmer | Game Designer"
- Tagline: "Crafting worlds through art, code, and design"
- Signature visual: Animated scene from "Until Then" aesthetic
- CTA: "Explore My Work" or "View Disciplines"

**Design Approach:**
- Cinematic full-screen hero with gradient background
- Soft particle effects (different from Aritsia's wind particles)
- Warm lighting simulating golden hour
- Subtle animation on load (fade in, gentle scale)

---

#### **Section 2: Discipline Tree (Multi-Disciplinary Hub)**
**Purpose:** Show how Game Developer, 2D Artist, Programmer, and Game Designer interweave  
**Layout Concept:**
- **Center Hub:** Core identity (OzonZ)
- **4 Branches:** Extending to each discipline
  - 🎮 **Game Developer** (left) — Systems, mechanics, gameplay architecture
  - 🎨 **2D Artist** (top) — Pixel art, sprites, visual assets
  - 💻 **Programmer** (right) — Code architecture, algorithms, technical skills
  - 🎭 **Game Designer** (bottom) — Narrative, UX, game feel

**Scannable Information:**
- Each discipline shows:
  - **Proficiency level** (visual progress ring, 0-100%)
  - **Key skills** (3-4 bullets per discipline)
  - **Sample projects** (1-2 featured pieces)
  - **Tech stack** (minimal icon list)

**Interactive Behavior:**
- Click each discipline to expand detailed breakdown
- Animated lines connecting disciplines to show relationships
- Hover effects reveal sub-skills
- Color-coded: Each discipline gets a warm color from palette

---

#### **Section 3: Project Gallery by Discipline**
**Purpose:** Show concrete examples of work across all 4 disciplines  
**Layout Concept:**
- **Discipline Filter Tabs:** Game Dev | Art | Code | Design (with icons)
- **Responsive Grid:** 3 columns (desktop), 2 (tablet), 1 (mobile)
- **Project Cards** with soft shadows & cinematic depth:
  - Thumbnail/preview image
  - Project title
  - Discipline(s) involved (multi-tag possible)
  - 1-2 sentence description
  - "View Details" link (opens modal or detail page)

**Project Structure:**
```json
{
  "id": "project_001",
  "title": "Pixel Art Character Sheet",
  "disciplines": ["2D Artist", "Game Developer"],
  "year": 2025,
  "thumbnail": "url",
  "description": "Complete character set with animations",
  "tags": ["pixel-art", "sprite-sheet", "character-design"],
  "links": {
    "github": "url",
    "artstation": "url",
    "demo": "url"
  }
}
```

**Scannable Design:**
- Clear visual hierarchy: Title > Disciplines > Description
- Discipline badges color-coded to discipline tree
- Quick access to GitHub/live demos
- No overwhelming text

---

#### **Section 4: Skill Breakdown (Detailed Proficiency)**
**Purpose:** Deep dive into technical & creative skills per discipline  
**Layout Concept:**
- **Vertical Accordion:** Each discipline expands to show:
  - **Technical Skills** (with proficiency bar: 0-100%)
    - Game Dev: C#, Unity, Godot, Game Architecture, Physics, AI
    - 2D Artist: Aseprite, Pixel Animation, Asset Pipeline, Color Theory
    - Programmer: Python, JavaScript, Data Structures, Performance Optimization
    - Designer: Narrative Design, Level Design, UX Design, Prototyping
  - **Experience Timeline:** Year-by-year progression in that discipline
  - **Notable Achievements:** Key projects or certifications

**Visual Approach:**
- Soft gradient backgrounds per discipline (matching color theme)
- Smooth expand/collapse animations
- Animated proficiency bars (count up on reveal)
- Mini-timeline with milestone markers

---

#### **Section 5: Contact & Call-to-Action**
**Purpose:** Guide evaluators/viewers to next action  
**Content Elements:**
- "Let's Collaborate" or "Get in Touch" headline
- Social/portfolio links:
  - GitHub (code repositories)
  - ArtStation (visual portfolio)
  - Itch.io (game demos)
  - LinkedIn (professional profile)
  - Email (direct contact)
- Call-to-action buttons:
  - "View Full GitHub"
  - "Download Portfolio PDF"
  - "Contact Me"

**Design:**
- Warm gradient background
- Soft button styles with glow on hover
- Link icons with descriptive text
- Social proof: Quick stats (e.g., "50+ GitHub projects", "30+ game jam entries")

---

## 🎨 Visual Design System

### Color Palette (Until Then Inspired)

```
Primary Warm Palette:
  --cream:        #FFF8F0         /* Soft cream background */
  --coral:        #FF8C6B         /* Warm coral accent */
  --gold:         #F4D35E         /* Golden accent */
  --lilac:        #D4A5D9         /* Soft purple */
  --mint:         #A8E6D8         /* Soft green */
  --warm-gray:    #D4C4B9         /* Soft shadow */

Discipline Colors:
  --game-dev:     #FF8C6B         /* Coral - energetic */
  --artist:       #F4D35E         /* Gold - creative */
  --programmer:   #A8E6D8         /* Mint - technical */
  --designer:     #D4A5D9         /* Lilac - imaginative */
```

### Typography

```
Headings: "Inter" or "Poppins" (modern, rounded)
  --heading-xl:   48px bold       /* Page titles */
  --heading-lg:   32px semibold   /* Section titles */
  --heading-md:   24px semibold   /* Card titles */

Body: "Inter" or "Fira Sans"
  --body-lg:      18px            /* Descriptions */
  --body-base:    16px            /* Standard text */
  --body-sm:      14px            /* Labels, captions */

Accents: Monospace for code snippets
```

### Component Styling

**Cards:**
- Soft rounded corners (12px)
- Subtle shadow: `0 8px 24px rgba(0,0,0,0.12)`
- Smooth hover lift: `transform: translateY(-4px)`
- Gentle background: cream with 2-3% color tint

**Buttons:**
- Rounded (8-12px)
- Soft shadow on default
- Warm glow on hover: `box-shadow: 0 0 20px rgba(coral, 0.6)`
- Text-based or minimal icon (no hard outlines)

**Modals:**
- Frosted glass effect (backdrop blur)
- Soft shadow frame
- Smooth entrance animation
- Centered with breathing space

---

## 📊 Data Architecture & API Contracts

### OzonZ-Specific Data Files

#### `ozonz-profile.json`
```json
{
  "name": "Chanon Thongduang",
  "handle": "OzonZ",
  "title": "Game Developer | 2D Artist | Programmer | Game Designer",
  "tagline": "Crafting worlds through art, code, and design",
  "bio": "Passionate about creating immersive game experiences...",
  "profileImage": "url",
  "location": "Thailand",
  "links": {
    "github": "https://github.com/OzonZ",
    "artstation": "https://www.artstation.com/ozonz",
    "itch": "https://ozonz.itch.io"
  }
}
```

#### `ozonz-disciplines.json`
```json
{
  "disciplines": [
    {
      "id": "game-dev",
      "name": "Game Developer",
      "icon": "🎮",
      "color": "#FF8C6B",
      "proficiency": 88,
      "description": "Systems architecture, gameplay mechanics, gameplay feel",
      "skills": [
        { "name": "C# / Unity", "level": 90 },
        { "name": "Godot Engine", "level": 85 },
        { "name": "Game Architecture", "level": 88 },
        { "name": "Physics Systems", "level": 82 }
      ],
      "projects": ["project_001", "project_003"],
      "timeline": [
        { "year": 2023, "milestone": "First published game" },
        { "year": 2024, "milestone": "10+ game jam entries" }
      ]
    },
    {
      "id": "2d-artist",
      "name": "2D Artist",
      "icon": "🎨",
      "color": "#F4D35E",
      "proficiency": 92,
      "description": "Pixel art, sprite animation, visual asset creation",
      "skills": [
        { "name": "Pixel Art (Aseprite)", "level": 95 },
        { "name": "Sprite Animation", "level": 92 },
        { "name": "Asset Pipeline", "level": 88 },
        { "name": "Color Theory", "level": 90 }
      ],
      "projects": ["project_002", "project_004"],
      "timeline": [...]
    }
    // ... Game Designer, Programmer
  ]
}
```

#### `ozonz-works.json`
```json
{
  "projects": [
    {
      "id": "project_001",
      "title": "Pixel Adventure Game",
      "disciplines": ["Game Developer", "2D Artist"],
      "year": 2025,
      "thumbnail": "url",
      "images": ["url1", "url2"],
      "description": "A retro-inspired adventure game...",
      "tags": ["game-dev", "pixel-art", "godot"],
      "proficiencies": {
        "Game Developer": 0.85,
        "2D Artist": 0.90
      },
      "links": {
        "github": "url",
        "itch": "url",
        "artstation": "url"
      }
    }
    // ... more projects
  ]
}
```

---

## 🔄 State Flow & Component Hierarchy

```
portfolio-ozonz.html (Page Load)
    ↓
portfolio-ozonz.js (initPortfolio)
    ├─ initSettings() → Load theme
    ├─ loadOzonZProfile() → Fetch ozonz-profile.json
    ├─ loadDisciplines() → Fetch ozonz-disciplines.json
    ├─ loadProjects() → Fetch ozonz-works.json
    └─ Render Sections:
        ├─ renderHero() → Personal intro
        ├─ renderDisciplineTree() → 4-discipline hub
        ├─ renderProjectGallery() → Filtered grid
        ├─ renderSkillBreakdown() → Accordion details
        ├─ renderContact() → CTA section
        └─ setupInteractions() → Event listeners
```

---

## 📐 Responsive Design

### Breakpoints
- **Desktop (1200px+):** Full 3-column grids, side-by-side layouts
- **Tablet (768-1199px):** 2-column grids, stacked panels
- **Mobile (480-767px):** Single column, accordion-based info
- **Small Mobile (<480px):** Compact fonts, minimal padding

### Mobile Considerations
- Touch-friendly tap targets (48px minimum)
- Simplified discipline tree (2x2 grid instead of cross pattern)
- Vertical project cards (full-width)
- Collapsible skill breakdown by default
- Bottom sheet modals instead of centered

---

## ✅ Success Criteria (OzonZ Specific)

- ✅ **Visual Separation:** OzonZ portfolio completely independent from Aritsia
- ✅ **Aesthetic Coherence:** "Until Then" aesthetic throughout (no voxel style)
- ✅ **Professionalism:** Suitable for academic/corporate portfolio reviews
- ✅ **Information Scanability:** Professors can grasp skills in <30 seconds
- ✅ **Multi-Discipline Clarity:** Art, Code, Design, Dev clearly interconnected
- ✅ **Responsive:** Perfect on all devices
- ✅ **Accessible:** WCAG AA compliance, semantic HTML
- ✅ **Performance:** Fast loading, smooth animations
- ✅ **No Conflicts:** Zero interference with Aritsia's system
- ✅ **Feature Parity:** Same core functionality as Aritsia (Skill Tree, Timeline, Works, Contact)

---

## 📂 Implementation Roadmap (Phase-Based)

### Phase 1: Foundation & Structure
- [ ] Create `portfolio-ozonz.html`
- [ ] Create `css/portfolio-ozonz.css` (Until Then design system)
- [ ] Create `js/portfolio-ozonz.js` (entry point)
- [ ] Design color palette & typography variables

### Phase 2: Data Modules
- [ ] Create `data/ozonz-profile.json`
- [ ] Create `data/ozonz-disciplines.json`
- [ ] Create `data/ozonz-works.json`
- [ ] Create `js/ozonz-disciplines.js` (data handler)
- [ ] Create `js/ozonz-projects.js` (project rendering)

### Phase 3: Section Implementation
- [ ] Build Hero section with cinematic intro
- [ ] Build Discipline Tree (4-hub layout)
- [ ] Build Project Gallery with filters
- [ ] Build Skill Breakdown accordion
- [ ] Build Contact/CTA section

### Phase 4: Polish & Integration
- [ ] Navigation between Aritsia & OzonZ portfolios
- [ ] Theme sync with shared settingsManager
- [ ] Responsive testing (all breakpoints)
- [ ] Animation polish
- [ ] Accessibility audit (WCAG AA)

### Phase 5: Deployment
- [ ] GitHub Pages deployment
- [ ] Performance optimization
- [ ] Analytics setup
- [ ] SEO optimization

---

## 🎭 Cursor-Friendly Implementation Prompts

### Prompt Pattern 1: Create Data Structure
```
"Create ozonz-disciplines.json with 4 disciplines:
1. Game Developer (proficiency 88%)
2. 2D Artist (proficiency 92%)
3. Programmer (proficiency 85%)
4. Game Designer (proficiency 87%)

Each discipline should have: name, icon, color (warm palette),
proficiency level, description, skills array with 4 items,
and a projects array referencing project IDs."
```

### Prompt Pattern 2: Render Discipline Hub
```
"Create renderDisciplineTree() in portfolio-ozonz.js that:
1. Reads ozonZState.disciplines
2. Creates 4 cards arranged in cross pattern (Game Dev-left, Artist-top, etc)
3. Each card shows proficiency ring, discipline name, 3 key skills
4. On click, card expands to show full details
5. Color-coded by discipline (warm palette)"
```

### Prompt Pattern 3: Cinematic Styling
```
"Style the hero section with Until Then aesthetic:
- Soft gradient background (cream → lilac)
- Large soft shadows (blur 24px, opacity 12%)
- Warm lighting effect on text (subtle glow)
- Rounded corners (12px minimum)
- Smooth fade-in animation on page load
- Golden hour color temperature throughout"
```

---

## 🚫 Architecture Boundaries (Keeping Aritsia Safe)

**What is PROTECTED (Aritsia's Workspace):**
- ✅ All files in `portfolio.html` and related
- ✅ All code in `portfolio.js`, `portfolio-skills.js`, `portfolio-timeline.js`
- ✅ Styling in `portfolio.css`
- ✅ Aritsia's pixel-art aesthetic and voxel design
- ✅ All authentication & settings manager integrations

**What is NEW (OzonZ's Workspace):**
- ✨ `portfolio-ozonz.html` (separate entry point)
- ✨ `css/portfolio-ozonz.css` (Until Then aesthetic)
- ✨ `js/portfolio-ozonz.js` (independent manager)
- ✨ `js/ozonz-disciplines.js` (multi-discipline logic)
- ✨ `js/ozonz-projects.js` (project rendering)
- ✨ `data/ozonz-profile.json`, `ozonz-disciplines.json`, `ozonz-works.json`

**No Shared Code Between Systems:**
- Separate CSS files (zero style conflicts)
- Separate JS modules (zero logic conflicts)
- Separate JSON data files
- Independent state management
- Independent rendering pipelines

---

## 🎯 Why This Architecture Works

1. **Total Independence:** OzonZ system runs completely separately
2. **Design Coherence:** Until Then aesthetic maintained throughout
3. **Professionalism:** Clean, scannable layouts for academic/corporate review
4. **Multi-Discipline Integration:** Art, Code, Design, Dev clearly interconnected
5. **Feature Parity:** Same capabilities as Aritsia but different visual language
6. **Performance:** No bloat, no conflicts with Aritsia's system
7. **Scalability:** Easy to add more disciplines or projects later
8. **Accessibility:** WCAG AA ready, semantic markup

---

## 🏁 Navigation Between Portfolios

### Proposed Navigation Strategy

**Main Index (index.html) Addition:**
```html
<!-- Portfolio Selection -->
<div class="portfolio-selector">
  <a href="portfolio.html" class="portfolio-link aritsia">
    ⚡ Aritsia's Portfolio
  </a>
  <a href="portfolio-ozonz.html" class="portfolio-link ozonz">
    🎨 OzonZ's Portfolio
  </a>
</div>
```

**Each Portfolio Navbar:**
- Back button to main gallery
- Link to sibling portfolio ("View Aritsia's Work" / "View OzonZ's Work")
- Theme switcher (shared)
- Help modal

This allows evaluators to easily explore both portfolios without confusion.

---

**OzonZ Architecture prepared for independent development. Ready to delegate modular implementation tasks while preserving Aritsia's existing codebase.**

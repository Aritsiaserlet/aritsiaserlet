// =============================================================================
// ARITSIA PORTFOLIO - Timeline Data & Rendering
// portfolio-timeline.js
// =============================================================================

// ── Timeline Data ──
const TIMELINE_DATA = [
  {
    id: "milestone_001",
    date: "2026-06",
    title: "Aritsia Portfolio System Launched",
    description: "Full-featured pixel-art portfolio with admin CMS and interactive skill tree",
    category: "Project",
    icon: "🚀",
    featured: true
  },
  {
    id: "milestone_002",
    date: "2026-01",
    title: "Firebase & Firestore Integration",
    description: "Implemented Google Auth and real-time database for likes/leaderboard system",
    category: "Milestone",
    icon: "✅"
  },
  {
    id: "milestone_003",
    date: "2025-10",
    title: "3D Model Viewer Implementation",
    description: "Integrated Three.js for GLB/GLTF model preview in portfolio entries",
    category: "Feature",
    icon: "🎮"
  },
  {
    id: "milestone_004",
    date: "2025-07",
    title: "Web Audio API Engine",
    description: "Built custom audio manager with per-channel volume/mute controls",
    category: "Feature",
    icon: "🔊"
  },
  {
    id: "milestone_005",
    date: "2025-03",
    title: "Admin CMS Panel Deployed",
    description: "GitHub-based content management system for works, settings, and assets",
    category: "Launch",
    icon: "⚙️"
  },
  {
    id: "milestone_006",
    date: "2024-12",
    title: "Theme System Completed",
    description: "5-color theme system with localStorage persistence and real-time switching",
    category: "Feature",
    icon: "🎨"
  }
];

// ── Portfolio State ──
let portfolioTimelineState = {
  timeline: TIMELINE_DATA,
  sorted: []
};

// ── Initialize Timeline ──
export async function initTimeline() {
  // Sort by date (newest first)
  portfolioTimelineState.sorted = [...TIMELINE_DATA].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  return portfolioTimelineState.sorted;
}

// ── Render Timeline ──
export function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  container.innerHTML = '';

  portfolioTimelineState.sorted.forEach((item, index) => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.style.animationDelay = `${index * 0.1}s`;

    // Marker
    const marker = document.createElement('div');
    marker.className = 'timeline-marker';
    marker.title = item.title;

    // Content
    const content = document.createElement('div');
    content.className = 'timeline-content';

    // Format date (YYYY-MM to Month Year)
    const dateObj = new Date(item.date + '-01');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });

    content.innerHTML = `
      <div class="timeline-date">${formattedDate}</div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-description">${item.description}</div>
      <span class="timeline-badge">${item.category}</span>
    `;

    // Icon in marker (visual indicator)
    marker.textContent = item.icon;

    timelineItem.appendChild(marker);
    timelineItem.appendChild(content);

    // Add hover effect
    content.addEventListener('mouseenter', () => {
      content.style.transform = 'scale(1.02)';
    });

    content.addEventListener('mouseleave', () => {
      content.style.transform = 'scale(1)';
    });

    container.appendChild(timelineItem);
  });
}

// ── Get Timeline Data ──
export function getTimeline() {
  return portfolioTimelineState.sorted;
}

// ── Get Timeline Item by ID ──
export function getTimelineItem(itemId) {
  return portfolioTimelineState.timeline.find(item => item.id === itemId);
}

// ── Get Timeline by Category ──
export function getTimelineByCategory(category) {
  return portfolioTimelineState.sorted.filter(
    item => item.category.toLowerCase() === category.toLowerCase()
  );
}

// ── Get Featured Timeline Items ──
export function getFeaturedTimeline() {
  return portfolioTimelineState.sorted.filter(item => item.featured);
}

// ── Add Timeline Item ──
export function addTimelineItem(item) {
  if (!item.id) item.id = `milestone_${Date.now()}`;
  if (!item.date) item.date = new Date().toISOString().split('T')[0];

  portfolioTimelineState.timeline.push(item);
  initTimeline(); // Re-sort
}

// ── Update Timeline Item ──
export function updateTimelineItem(itemId, updates) {
  const item = portfolioTimelineState.timeline.find(i => i.id === itemId);
  if (item) {
    Object.assign(item, updates);
    initTimeline(); // Re-sort
    return true;
  }
  return false;
}

// ── Delete Timeline Item ──
export function deleteTimelineItem(itemId) {
  const index = portfolioTimelineState.timeline.findIndex(i => i.id === itemId);
  if (index !== -1) {
    portfolioTimelineState.timeline.splice(index, 1);
    initTimeline(); // Re-sort
    return true;
  }
  return false;
}

// ── Get Timeline Stats ──
export function getTimelineStats() {
  return {
    total: portfolioTimelineState.timeline.length,
    categories: [...new Set(portfolioTimelineState.timeline.map(i => i.category))],
    featured: getFeaturedTimeline().length,
    dateRange: {
      earliest: portfolioTimelineState.sorted[portfolioTimelineState.sorted.length - 1]?.date,
      latest: portfolioTimelineState.sorted[0]?.date
    }
  };
}

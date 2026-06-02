// =============================================================================
// ARITSIA PORTFOLIO - Skill Tree Data & Rendering
// portfolio-skills.js
// =============================================================================

// ── Skill Tree Data (from skill.md) ──
const SKILL_TREE_DATA = {
  "Frontend Development": {
    level: 95,
    description: "HTML5, CSS3, Vanilla JavaScript with modern ES6+ patterns",
    skills: [
      { name: "Responsive Design", proficiency: 95 },
      { name: "CSS Grid & Flexbox", proficiency: 90 },
      { name: "Web Audio API", proficiency: 88 },
      { name: "Canvas API", proficiency: 85 }
    ]
  },
  "UI/UX Design": {
    level: 92,
    description: "Impeccable design with pixel-perfect precision and micro-interactions",
    skills: [
      { name: "Design Systems", proficiency: 92 },
      { name: "Accessibility (A11y)", proficiency: 88 },
      { name: "Micro-interactions", proficiency: 90 },
      { name: "Theme Management", proficiency: 92 }
    ]
  },
  "3D Graphics": {
    level: 85,
    description: "Three.js integration and WebGL model visualization",
    skills: [
      { name: "Three.js", proficiency: 85 },
      { name: "GLB/GLTF Models", proficiency: 87 },
      { name: "Lighting & Materials", proficiency: 82 },
      { name: "Camera Controls", proficiency: 80 }
    ]
  },
  "Game Development": {
    level: 80,
    description: "Canvas 2D game mechanics and interactive experiences",
    skills: [
      { name: "Canvas 2D", proficiency: 85 },
      { name: "Game Physics", proficiency: 78 },
      { name: "Animation & Sprites", proficiency: 82 },
      { name: "Audio Integration", proficiency: 82 }
    ]
  },
  "Backend-as-a-Service": {
    level: 88,
    description: "Firebase, GitHub API, and no-backend serverless architecture",
    skills: [
      { name: "Firebase Auth", proficiency: 90 },
      { name: "Firestore Database", proficiency: 87 },
      { name: "GitHub API (REST)", proficiency: 88 },
      { name: "REST Integration", proficiency: 85 }
    ]
  }
};

// ── Portfolio State ──
let portfolioSkillState = {
  skills: SKILL_TREE_DATA,
  expandedCategory: null
};

// ── Initialize Skill Tree ──
export async function initSkillTree() {
  portfolioSkillState.skills = SKILL_TREE_DATA;
  return SKILL_TREE_DATA;
}

// ── Render Skill Tree ──
export function renderSkillTree() {
  const container = document.getElementById('skillsContainer');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(portfolioSkillState.skills).forEach(([categoryName, categoryData]) => {
    const skillCard = document.createElement('div');
    skillCard.className = 'skill-category';
    skillCard.dataset.category = categoryName;

    // Calculate animation delay for staggered effect
    const delay = Object.keys(portfolioSkillState.skills).indexOf(categoryName) * 0.1;
    skillCard.style.animationDelay = `${delay}s`;

    // Header with name and level
    const header = document.createElement('div');
    header.className = 'skill-category-name';
    header.innerHTML = `
      <span>${categoryName}</span>
      <span class="skill-level">${categoryData.level}%</span>
    `;

    // Proficiency bar
    const barBg = document.createElement('div');
    barBg.className = 'skill-bar-bg';
    const bar = document.createElement('div');
    bar.className = 'skill-bar';
    bar.style.width = '0%';
    barBg.appendChild(bar);

    // Animate bar on render
    setTimeout(() => {
      bar.style.width = `${categoryData.level}%`;
    }, 100);

    // Description (hidden by default)
    const desc = document.createElement('div');
    desc.className = 'skill-description';
    desc.textContent = categoryData.description;

    // Skills list (hidden by default)
    const list = document.createElement('ul');
    list.className = 'skill-list';

    categoryData.skills.forEach(skill => {
      const item = document.createElement('li');
      item.className = 'skill-item';
      item.innerHTML = `
        <span class="skill-name">${skill.name}</span>
        <span class="skill-proficiency">${skill.proficiency}%</span>
      `;
      list.appendChild(item);
    });

    // Append all elements
    skillCard.appendChild(header);
    skillCard.appendChild(barBg);
    skillCard.appendChild(desc);
    skillCard.appendChild(list);

    // Toggle expand on click
    skillCard.addEventListener('click', () => {
      const isExpanded = skillCard.classList.contains('expanded');
      
      // Close all other categories
      document.querySelectorAll('.skill-category').forEach(card => {
        card.classList.remove('expanded');
      });

      // Toggle current
      if (!isExpanded) {
        skillCard.classList.add('expanded');
        portfolioSkillState.expandedCategory = categoryName;
      } else {
        portfolioSkillState.expandedCategory = null;
      }
    });

    // Hover effect
    skillCard.addEventListener('mouseenter', () => {
      if (!skillCard.classList.contains('expanded')) {
        skillCard.style.opacity = '0.9';
      }
    });

    skillCard.addEventListener('mouseleave', () => {
      if (!skillCard.classList.contains('expanded')) {
        skillCard.style.opacity = '1';
      }
    });

    container.appendChild(skillCard);
  });
}

// ── Get Skill Tree Data ──
export function getSkillTree() {
  return portfolioSkillState.skills;
}

// ── Get Skill Category ──
export function getSkillCategory(categoryName) {
  return portfolioSkillState.skills[categoryName] || null;
}

// ── Get All Skills Flattened ──
export function getAllSkills() {
  const allSkills = [];
  Object.entries(portfolioSkillState.skills).forEach(([category, data]) => {
    data.skills.forEach(skill => {
      allSkills.push({
        category,
        name: skill.name,
        proficiency: skill.proficiency
      });
    });
  });
  return allSkills;
}

// ── Calculate Average Proficiency ──
export function getAverageProficiency() {
  const allSkills = getAllSkills();
  const sum = allSkills.reduce((acc, skill) => acc + skill.proficiency, 0);
  return Math.round(sum / allSkills.length);
}

// ── Get Top Skills ──
export function getTopSkills(limit = 5) {
  return getAllSkills()
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, limit);
}

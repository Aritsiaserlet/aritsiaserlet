// settingsManager.js
// Handles all user settings (Theme, Graphics, Audio) under a single localStorage key: "portfolioSettings"

const SETTINGS_KEY = 'portfolioSettings';

const defaultSettings = {
  theme: 'Blue',
  graphics: 'High',
  masterVolume: 100,
  musicVolume: 100,
  sfxVolume: 100,
  masterMute: false,
  musicMute: false,
  sfxMute: false
};

// Available theme definitions
const THEMES = {
  Blue: {
    '--sky1': '#4a9fd4', '--sky2': '#7ec8e8', '--sky3': '#aaddee', '--sky4': '#cceeff',
    '--gold': '#e8c87a', '--gold-d': '#c8a040', '--gold-l': '#f5e0a0',
    '--dark': '#1a2a3a', '--mid': '#2c4a6a'
  },
  Purple: {
    '--sky1': '#8e44ad', '--sky2': '#9b59b6', '--sky3': '#c39bd3', '--sky4': '#d7bde2',
    '--gold': '#f1c40f', '--gold-d': '#f39c12', '--gold-l': '#f9e79f',
    '--dark': '#2c3e50', '--mid': '#34495e'
  },
  Green: {
    '--sky1': '#27ae60', '--sky2': '#2ecc71', '--sky3': '#7dcea0', '--sky4': '#abebc6',
    '--gold': '#e67e22', '--gold-d': '#d35400', '--gold-l': '#edbb99',
    '--dark': '#145a32', '--mid': '#1e8449'
  },
  Orange: {
    '--sky1': '#d35400', '--sky2': '#e67e22', '--sky3': '#edbb99', '--sky4': '#f5cba7',
    '--gold': '#2980b9', '--gold-d': '#2471a3', '--gold-l': '#7fb3d5',
    '--dark': '#6e2c00', '--mid': '#a04000'
  },
  Red: {
    '--sky1': '#c0392b', '--sky2': '#e74c3c', '--sky3': '#f1948a', '--sky4': '#fadbd8',
    '--gold': '#f1c40f', '--gold-d': '#f39c12', '--gold-l': '#f9e79f',
    '--dark': '#641e16', '--mid': '#78281f'
  }
};

let currentSettings = { ...defaultSettings };

export function initSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Error parsing portfolio settings, resetting to defaults.");
    }
  }
  applySettings(currentSettings);
}

export function getSettings() {
  return currentSettings;
}

export function updateSettings(newSettings) {
  currentSettings = { ...currentSettings, ...newSettings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
  applySettings(currentSettings);
}

function applySettings(settings) {
  // 1. Apply Theme
  const themeColors = THEMES[settings.theme] || THEMES['Blue'];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(themeColors)) {
    root.style.setProperty(key, value);
  }

  // 2. Dispatch event for Game/Audio managers to pick up Graphics/Audio changes
  window.dispatchEvent(new CustomEvent('portfolioSettingsChanged', { detail: settings }));
}

// Auto-init on load if imported as module
initSettings();

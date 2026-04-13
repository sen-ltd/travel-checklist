/**
 * main.js — DOM orchestration, event handling, rendering.
 * Depends on checklist.js, items.js, i18n.js.
 * No build step; runs as ES module in the browser.
 */

import { generateChecklist, groupByCategory, sortByPriority } from './checklist.js';
import { CATEGORIES } from './items.js';
import { t, TRANSLATIONS } from './i18n.js';

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  lang: 'ja',
  theme: 'light',
  profile: {
    destination: 'domestic',
    days: 3,
    season: 'summer',
    transport: 'plane',
    tripType: 'leisure',
  },
  checklist: [],   // [{...item, checked: boolean}]
  customItems: [], // user-added items
  generated: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return [...document.querySelectorAll(sel)]; }

function currentLang() { return state.lang; }
function tr(key) { return t(key, currentLang()); }

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('travel-checklist-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lang) state.lang = parsed.lang;
      if (parsed.theme) state.theme = parsed.theme;
    }
  } catch (_) { /* ignore */ }
}

function saveToStorage() {
  try {
    localStorage.setItem('travel-checklist-state', JSON.stringify({
      lang: state.lang,
      theme: state.theme,
    }));
  } catch (_) { /* ignore */ }
}

function getSavedProfiles() {
  try {
    return JSON.parse(localStorage.getItem('travel-checklist-profiles') || '{}');
  } catch (_) { return {}; }
}

function setSavedProfiles(profiles) {
  try {
    localStorage.setItem('travel-checklist-profiles', JSON.stringify(profiles));
  } catch (_) { /* ignore */ }
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = $('#theme-toggle');
  if (btn) btn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

function applyLang() {
  // Update all data-i18n elements
  $$('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = tr(key);
  });

  // Update placeholders
  $$('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = tr(el.getAttribute('data-i18n-placeholder'));
  });

  // Lang toggle button
  const btn = $('#lang-toggle');
  if (btn) btn.textContent = tr('langToggle');

  // Days label
  updateDaysLabel();

  // Re-render checklist if generated
  if (state.generated) renderChecklist();

  // Update profile dropdown labels
  renderProfileList();
}

function updateDaysLabel() {
  const label = $('#days-label');
  const val = $('#days-value');
  if (label) label.textContent = tr('labelDays');
  if (val) val.textContent = `${state.profile.days} ${state.profile.days === 1 ? tr('day') : tr('days')}`;
}

function updateProgress() {
  const total = state.checklist.length;
  const checked = state.checklist.filter((i) => i.checked).length;
  const bar = $('#progress-bar');
  const label = $('#progress-label');
  if (bar) bar.style.width = total ? `${(checked / total) * 100}%` : '0%';
  if (label) {
    label.textContent = total
      ? `${checked} ${tr('totalCount')} ${total} ${tr('checkedCount')}`
      : '';
  }
}

function renderChecklist() {
  const container = $('#checklist-container');
  if (!container) return;

  if (!state.generated || state.checklist.length === 0) {
    container.innerHTML = `<p class="empty-msg">${tr('noItems')}</p>`;
    updateProgress();
    return;
  }

  const grouped = groupByCategory(state.checklist);

  let html = '';
  CATEGORIES.forEach((cat) => {
    const items = grouped[cat];
    if (!items || items.length === 0) return;

    const sorted = sortByPriority(items);
    html += `<section class="category-section" data-category="${cat}">
      <h3 class="category-title">${tr(cat)}</h3>
      <ul class="item-list">`;

    sorted.forEach((item) => {
      const nameText = item.name[currentLang()] || item.name.en || item.name.ja || item.id;
      const priorityLabel = item.priority ? `<span class="badge badge--${item.priority}">${tr(item.priority)}</span>` : '';
      const customTag = item.custom ? '<span class="badge badge--custom">+</span>' : '';
      const checkedClass = item.checked ? 'item--checked' : '';

      html += `<li class="item ${checkedClass}" data-id="${item.id}">
        <label class="item-label">
          <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
          <span class="item-name">${nameText}</span>
          ${priorityLabel}${customTag}
        </label>
        ${item.custom ? `<button class="item-delete" data-id="${item.id}" aria-label="remove">×</button>` : ''}
      </li>`;
    });

    html += `</ul></section>`;
  });

  // Also render any custom items in misc that don't have a category
  const customMisc = (grouped['misc'] || []).filter((i) => i.custom);
  // (already included above via CATEGORIES loop)

  container.innerHTML = html;
  updateProgress();

  // Attach checkbox listeners
  $$('.item-checkbox').forEach((cb) => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const item = state.checklist.find((i) => i.id === id);
      if (item) {
        item.checked = e.target.checked;
        const li = e.target.closest('.item');
        if (li) li.classList.toggle('item--checked', item.checked);
        updateProgress();
      }
    });
  });

  // Attach delete listeners for custom items
  $$('.item-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      state.customItems = state.customItems.filter((i) => i.id !== id);
      state.checklist = state.checklist.filter((i) => i.id !== id);
      renderChecklist();
    });
  });
}

function renderProfileList() {
  const select = $('#profile-select');
  if (!select) return;

  const profiles = getSavedProfiles();
  const keys = Object.keys(profiles);

  select.innerHTML = `<option value="">${tr('loadProfile')}</option>`;
  keys.forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

function handleGenerate() {
  // Read profile from form
  state.profile.destination = $('#input-destination').value;
  state.profile.days = parseInt($('#input-days').value, 10) || 3;
  state.profile.season = $('#input-season').value;
  state.profile.transport = $('#input-transport').value;
  state.profile.tripType = $('#input-tripType').value;

  state.checklist = generateChecklist(state.profile, state.customItems);
  state.generated = true;
  renderChecklist();

  // Scroll to checklist
  $('#checklist-section')?.scrollIntoView({ behavior: 'smooth' });
}

function handleSaveProfile() {
  const name = prompt(tr('profileName'), tr('profileNamePlaceholder'));
  if (!name || !name.trim()) return;

  const profiles = getSavedProfiles();
  profiles[name.trim()] = { ...state.profile };
  setSavedProfiles(profiles);
  renderProfileList();
  showToast(tr('profileSaved'));
}

function handleLoadProfile(name) {
  if (!name) return;
  const profiles = getSavedProfiles();
  const prof = profiles[name];
  if (!prof) return;

  state.profile = { ...prof };
  syncFormToProfile();
}

function handleDeleteProfile(name) {
  if (!name) return;
  const profiles = getSavedProfiles();
  delete profiles[name];
  setSavedProfiles(profiles);
  renderProfileList();
}

function handleAddCustomItem() {
  const input = $('#custom-item-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const id = `custom-${Date.now()}`;
  const newItem = {
    id,
    category: 'misc',
    name: { ja: text, en: text },
    conditions: {},
    priority: 'medium',
    checked: false,
    custom: true,
  };

  state.customItems.push(newItem);
  if (state.generated) {
    state.checklist.push({ ...newItem });
    renderChecklist();
  }
  input.value = '';
  input.focus();
}

function syncFormToProfile() {
  const { destination, days, season, transport, tripType } = state.profile;
  const dEl = $('#input-destination');
  const dayEl = $('#input-days');
  const sEl = $('#input-season');
  const tEl = $('#input-transport');
  const ttEl = $('#input-tripType');

  if (dEl) dEl.value = destination;
  if (dayEl) { dayEl.value = days; updateDaysLabel(); }
  if (sEl) sEl.value = season;
  if (tEl) tEl.value = transport;
  if (ttEl) ttEl.value = tripType;
}

function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('toast--visible');
  setTimeout(() => toast.classList.remove('toast--visible'), 2500);
}

function handlePrint() {
  window.print();
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

function init() {
  loadFromStorage();
  applyTheme();

  // Theme toggle
  const themeBtn = $('#theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme();
      saveToStorage();
    });
  }

  // Lang toggle
  const langBtn = $('#lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      state.lang = state.lang === 'ja' ? 'en' : 'ja';
      saveToStorage();
      applyLang();
    });
  }

  // Days slider
  const daysSlider = $('#input-days');
  if (daysSlider) {
    daysSlider.addEventListener('input', (e) => {
      state.profile.days = parseInt(e.target.value, 10);
      updateDaysLabel();
    });
  }

  // Generate button
  const generateBtn = $('#generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', handleGenerate);
  }

  // Save profile
  const saveBtn = $('#save-profile-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveProfile);
  }

  // Load / delete profile
  const profileSelect = $('#profile-select');
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => handleLoadProfile(e.target.value));
  }
  const deleteBtn = $('#delete-profile-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const sel = $('#profile-select');
      if (sel && sel.value) handleDeleteProfile(sel.value);
      if (sel) sel.value = '';
    });
  }

  // Add custom item
  const addBtn = $('#add-item-btn');
  if (addBtn) addBtn.addEventListener('click', handleAddCustomItem);
  const customInput = $('#custom-item-input');
  if (customInput) {
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddCustomItem();
    });
  }

  // Print
  const printBtn = $('#print-btn');
  if (printBtn) printBtn.addEventListener('click', handlePrint);

  // Initial language render
  applyLang();
  renderProfileList();
  updateDaysLabel();
  renderChecklist(); // show empty state message
}

document.addEventListener('DOMContentLoaded', init);

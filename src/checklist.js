/**
 * Pure logic for generating and manipulating travel checklists.
 * No DOM, no side effects.
 */

import { ITEMS } from './items.js';

/**
 * @typedef {Object} Profile
 * @property {'domestic'|'international'} destination
 * @property {'spring'|'summer'|'fall'|'winter'} season
 * @property {number} days - 1-30
 * @property {'plane'|'train'|'car'} transport
 * @property {'business'|'leisure'|'adventure'|'beach'} tripType
 */

/**
 * Determine whether a single item matches the given profile.
 *
 * Rules (ALL non-empty conditions must match = AND logic):
 *  - destination: item appears when profile.destination is in the array
 *  - season: item appears when profile.season is in the array
 *  - transport: item appears when profile.transport is in the array
 *  - tripType: item appears when profile.tripType is in the array
 *  - minDays: item appears when profile.days >= minDays
 *  - maxDays: item appears when profile.days <= maxDays
 *
 * When conditionLogic === 'any' (used for compound cases like sunscreen),
 * at least ONE of the top-level conditions must match.
 *
 * @param {Object} item
 * @param {Profile} profile
 * @returns {boolean}
 */
export function matchesConditions(item, profile) {
  const { conditions = {} } = item;

  // Empty conditions → always included
  if (Object.keys(conditions).length === 0) {
    return true;
  }

  const checks = [];

  if (conditions.destination) {
    checks.push(conditions.destination.includes(profile.destination));
  }
  if (conditions.season) {
    checks.push(conditions.season.includes(profile.season));
  }
  if (conditions.transport) {
    checks.push(conditions.transport.includes(profile.transport));
  }
  if (conditions.tripType) {
    checks.push(conditions.tripType.includes(profile.tripType));
  }
  if (conditions.minDays !== undefined) {
    checks.push(profile.days >= conditions.minDays);
  }
  if (conditions.maxDays !== undefined) {
    checks.push(profile.days <= conditions.maxDays);
  }

  if (item.conditionLogic === 'any') {
    return checks.some(Boolean);
  }
  return checks.every(Boolean);
}

/**
 * Generate checklist items for a given profile, merging custom items.
 *
 * @param {Profile} profile
 * @param {Object[]} [customItems=[]] - user-added items (already match by definition)
 * @returns {Object[]} filtered items with `checked: false` and `custom: false`
 */
export function generateChecklist(profile, customItems = []) {
  const base = ITEMS
    .filter((item) => matchesConditions(item, profile))
    .map((item) => ({ ...item, checked: false, custom: false }));

  const extras = customItems.map((item) => ({
    ...item,
    checked: item.checked ?? false,
    custom: true,
  }));

  return [...base, ...extras];
}

/**
 * Group an array of items by their category.
 *
 * @param {Object[]} items
 * @returns {Object} { category: items[] }
 */
export function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const cat = item.category ?? 'misc';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/**
 * Sort items by priority (critical first).
 *
 * @param {Object[]} items
 * @returns {Object[]} new sorted array
 */
export function sortByPriority(items) {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    return pa - pb;
  });
}

/**
 * Human-readable label for a condition key-value pair.
 *
 * @param {string} key  - condition key ('destination', 'minDays', etc.)
 * @param {*} value     - condition value
 * @param {'ja'|'en'} [lang='en']
 * @returns {string}
 */
export function getConditionMeta(key, value, lang = 'en') {
  const labels = {
    destination: {
      international: { ja: '海外旅行', en: 'International travel' },
      domestic: { ja: '国内旅行', en: 'Domestic travel' },
    },
    season: {
      spring: { ja: '春', en: 'Spring' },
      summer: { ja: '夏', en: 'Summer' },
      fall: { ja: '秋', en: 'Fall' },
      winter: { ja: '冬', en: 'Winter' },
    },
    transport: {
      plane: { ja: '飛行機', en: 'Plane' },
      train: { ja: '電車', en: 'Train' },
      car: { ja: '車', en: 'Car' },
    },
    tripType: {
      business: { ja: 'ビジネス', en: 'Business' },
      leisure: { ja: '観光', en: 'Leisure' },
      adventure: { ja: 'アドベンチャー', en: 'Adventure' },
      beach: { ja: 'ビーチ', en: 'Beach' },
    },
    minDays: null,
    maxDays: null,
  };

  if (key === 'minDays') {
    return lang === 'ja' ? `${value}日以上` : `${value}+ day trip`;
  }
  if (key === 'maxDays') {
    return lang === 'ja' ? `${value}日以下` : `up to ${value} days`;
  }

  const map = labels[key];
  if (!map) return `${key}:${value}`;

  const values = Array.isArray(value) ? value : [value];
  return values
    .map((v) => (map[v] ? map[v][lang] : v))
    .join(lang === 'ja' ? '・' : ' / ');
}

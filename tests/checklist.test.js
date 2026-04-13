/**
 * Tests for checklist.js pure logic.
 * Run with: node --test tests/checklist.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  matchesConditions,
  generateChecklist,
  groupByCategory,
  sortByPriority,
  getConditionMeta,
} from '../src/checklist.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseProfile = {
  destination: 'domestic',
  season: 'summer',
  days: 3,
  transport: 'plane',
  tripType: 'leisure',
};

const intlProfile = {
  destination: 'international',
  season: 'summer',
  days: 5,
  transport: 'plane',
  tripType: 'leisure',
};

const winterProfile = {
  destination: 'domestic',
  season: 'winter',
  days: 3,
  transport: 'train',
  tripType: 'leisure',
};

const beachProfile = {
  destination: 'international',
  season: 'summer',
  days: 7,
  transport: 'plane',
  tripType: 'beach',
};

const businessProfile = {
  destination: 'domestic',
  season: 'fall',
  days: 2,
  transport: 'plane',
  tripType: 'business',
};

const adventureProfile = {
  destination: 'domestic',
  season: 'spring',
  days: 5,
  transport: 'car',
  tripType: 'adventure',
};

const longTripProfile = {
  destination: 'international',
  season: 'summer',
  days: 14,
  transport: 'plane',
  tripType: 'leisure',
};

// ─── matchesConditions ───────────────────────────────────────────────────────

test('matchesConditions: no conditions → always true', () => {
  const item = { id: 'x', conditions: {} };
  assert.equal(matchesConditions(item, baseProfile), true);
  assert.equal(matchesConditions(item, intlProfile), true);
});

test('matchesConditions: international only — matches international profile', () => {
  const item = { id: 'passport', conditions: { destination: ['international'] } };
  assert.equal(matchesConditions(item, intlProfile), true);
});

test('matchesConditions: international only — does not match domestic profile', () => {
  const item = { id: 'passport', conditions: { destination: ['international'] } };
  assert.equal(matchesConditions(item, baseProfile), false);
});

test('matchesConditions: plane transport matches plane profile', () => {
  const item = { id: 'boarding-pass', conditions: { transport: ['plane'] } };
  assert.equal(matchesConditions(item, baseProfile), true);
});

test('matchesConditions: plane transport does not match car profile', () => {
  const item = { id: 'boarding-pass', conditions: { transport: ['plane'] } };
  assert.equal(matchesConditions(item, adventureProfile), false);
});

test('matchesConditions: winter season matches winter profile', () => {
  const item = { id: 'coat', conditions: { season: ['winter'] } };
  assert.equal(matchesConditions(item, winterProfile), true);
});

test('matchesConditions: winter season does not match summer profile', () => {
  const item = { id: 'coat', conditions: { season: ['winter'] } };
  assert.equal(matchesConditions(item, baseProfile), false);
});

test('matchesConditions: tripType beach matches beach profile', () => {
  const item = { id: 'swimsuit', conditions: { tripType: ['beach'] } };
  assert.equal(matchesConditions(item, beachProfile), true);
});

test('matchesConditions: tripType beach does not match business profile', () => {
  const item = { id: 'swimsuit', conditions: { tripType: ['beach'] } };
  assert.equal(matchesConditions(item, businessProfile), false);
});

test('matchesConditions: minDays=7 included when days >= 7', () => {
  const item = { id: 'laundry-bag', conditions: { minDays: 7 } };
  assert.equal(matchesConditions(item, { ...baseProfile, days: 7 }), true);
  assert.equal(matchesConditions(item, { ...baseProfile, days: 14 }), true);
});

test('matchesConditions: minDays=7 excluded when days < 7', () => {
  const item = { id: 'laundry-bag', conditions: { minDays: 7 } };
  assert.equal(matchesConditions(item, { ...baseProfile, days: 6 }), false);
  assert.equal(matchesConditions(item, { ...baseProfile, days: 1 }), false);
});

test('matchesConditions: maxDays excludes long trips', () => {
  const item = { id: 'short-trip-item', conditions: { maxDays: 3 } };
  assert.equal(matchesConditions(item, { ...baseProfile, days: 3 }), true);
  assert.equal(matchesConditions(item, { ...baseProfile, days: 4 }), false);
});

test('matchesConditions: multiple conditions (AND) — all must match', () => {
  const item = {
    id: 'intl-car',
    conditions: { destination: ['international'], transport: ['car'] },
  };
  assert.equal(matchesConditions(item, { ...intlProfile, transport: 'car' }), true);
  assert.equal(matchesConditions(item, { ...intlProfile, transport: 'plane' }), false);
  assert.equal(matchesConditions(item, { ...baseProfile, transport: 'car' }), false);
});

test('matchesConditions: conditionLogic=any — at least one must match', () => {
  const item = {
    id: 'sunscreen',
    conditions: { season: ['summer'], tripType: ['beach', 'adventure'] },
    conditionLogic: 'any',
  };
  // summer matches season
  assert.equal(matchesConditions(item, { ...baseProfile, season: 'summer' }), true);
  // beach matches tripType
  assert.equal(matchesConditions(item, { ...beachProfile, season: 'winter' }), true);
  // neither matches
  assert.equal(matchesConditions(item, { ...winterProfile, tripType: 'business' }), false);
});

// ─── generateChecklist ───────────────────────────────────────────────────────

test('generateChecklist: international trip includes passport', () => {
  const list = generateChecklist(intlProfile);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('passport'), 'passport should be in international checklist');
});

test('generateChecklist: domestic trip does not include passport', () => {
  const list = generateChecklist(baseProfile);
  const ids = list.map((i) => i.id);
  assert.ok(!ids.includes('passport'), 'passport should NOT be in domestic checklist');
});

test('generateChecklist: beach trip includes swimsuit', () => {
  const list = generateChecklist(beachProfile);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('swimsuit'), 'swimsuit should be in beach checklist');
});

test('generateChecklist: non-beach trip does not include swimsuit', () => {
  const list = generateChecklist(businessProfile);
  const ids = list.map((i) => i.id);
  assert.ok(!ids.includes('swimsuit'), 'swimsuit should NOT be in business checklist');
});

test('generateChecklist: winter trip includes winter-coat and gloves', () => {
  const list = generateChecklist(winterProfile);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('winter-coat'), 'winter-coat should be in winter checklist');
  assert.ok(ids.includes('gloves'), 'gloves should be in winter checklist');
});

test('generateChecklist: summer trip does not include winter-coat', () => {
  const list = generateChecklist(beachProfile);
  const ids = list.map((i) => i.id);
  assert.ok(!ids.includes('winter-coat'), 'winter-coat should NOT be in summer checklist');
});

test('generateChecklist: long trip (14 days) includes laundry-bag', () => {
  const list = generateChecklist(longTripProfile);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('laundry-bag'), 'laundry-bag should be in 14-day checklist');
});

test('generateChecklist: short trip (3 days) does not include laundry-bag', () => {
  const list = generateChecklist(baseProfile); // 3 days
  const ids = list.map((i) => i.id);
  assert.ok(!ids.includes('laundry-bag'), 'laundry-bag should NOT be in 3-day checklist');
});

test('generateChecklist: plane trip includes boarding-pass and liquids-bag', () => {
  const list = generateChecklist(baseProfile);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('boarding-pass'), 'boarding-pass should be in plane checklist');
  assert.ok(ids.includes('liquids-bag'), 'liquids-bag should be in plane checklist');
});

test('generateChecklist: car trip does not include boarding-pass', () => {
  const list = generateChecklist(adventureProfile);
  const ids = list.map((i) => i.id);
  assert.ok(!ids.includes('boarding-pass'), 'boarding-pass should NOT be in car checklist');
});

test('generateChecklist: all items have checked=false by default', () => {
  const list = generateChecklist(baseProfile);
  assert.ok(list.length > 0, 'checklist should not be empty');
  list.forEach((item) => {
    assert.equal(item.checked, false, `item ${item.id} should start unchecked`);
  });
});

test('generateChecklist: custom items are merged into result', () => {
  const custom = [{
    id: 'my-custom',
    category: 'misc',
    name: { ja: 'カスタム', en: 'Custom' },
    conditions: {},
    priority: 'medium',
  }];
  const list = generateChecklist(baseProfile, custom);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('my-custom'), 'custom item should appear in checklist');
  const found = list.find((i) => i.id === 'my-custom');
  assert.equal(found.custom, true, 'custom item should have custom=true');
});

test('generateChecklist: business trip includes laptop and business-suit', () => {
  const list = generateChecklist(businessProfile);
  const ids = list.map((i) => i.id);
  assert.ok(ids.includes('laptop'), 'laptop should be in business checklist');
  assert.ok(ids.includes('business-suit'), 'business-suit should be in business checklist');
});

// ─── groupByCategory ─────────────────────────────────────────────────────────

test('groupByCategory: groups items correctly', () => {
  const items = [
    { id: 'a', category: 'documents' },
    { id: 'b', category: 'clothing' },
    { id: 'c', category: 'documents' },
  ];
  const grouped = groupByCategory(items);
  assert.equal(grouped.documents.length, 2);
  assert.equal(grouped.clothing.length, 1);
});

test('groupByCategory: returns empty object for no items', () => {
  const grouped = groupByCategory([]);
  assert.deepEqual(grouped, {});
});

test('groupByCategory: items without category default to misc', () => {
  const items = [{ id: 'x' }];
  const grouped = groupByCategory(items);
  assert.ok(grouped.misc, 'should fall back to misc');
  assert.equal(grouped.misc[0].id, 'x');
});

// ─── sortByPriority ──────────────────────────────────────────────────────────

test('sortByPriority: critical comes before high, medium, low', () => {
  const items = [
    { id: 'low', priority: 'low' },
    { id: 'critical', priority: 'critical' },
    { id: 'medium', priority: 'medium' },
    { id: 'high', priority: 'high' },
  ];
  const sorted = sortByPriority(items);
  assert.equal(sorted[0].priority, 'critical');
  assert.equal(sorted[1].priority, 'high');
  assert.equal(sorted[2].priority, 'medium');
  assert.equal(sorted[3].priority, 'low');
});

test('sortByPriority: does not mutate original array', () => {
  const items = [
    { id: 'b', priority: 'low' },
    { id: 'a', priority: 'critical' },
  ];
  const sorted = sortByPriority(items);
  assert.equal(items[0].id, 'b', 'original order preserved');
  assert.equal(sorted[0].id, 'a', 'sorted puts critical first');
});

// ─── getConditionMeta ────────────────────────────────────────────────────────

test('getConditionMeta: returns human label for destination in ja', () => {
  const label = getConditionMeta('destination', ['international'], 'ja');
  assert.equal(label, '海外旅行');
});

test('getConditionMeta: returns human label for destination in en', () => {
  const label = getConditionMeta('destination', ['international'], 'en');
  assert.equal(label, 'International travel');
});

test('getConditionMeta: minDays returns days label', () => {
  const ja = getConditionMeta('minDays', 7, 'ja');
  assert.equal(ja, '7日以上');
  const en = getConditionMeta('minDays', 7, 'en');
  assert.equal(en, '7+ day trip');
});

test('getConditionMeta: maxDays returns days label', () => {
  const en = getConditionMeta('maxDays', 3, 'en');
  assert.equal(en, 'up to 3 days');
});

test('getConditionMeta: season in en', () => {
  const label = getConditionMeta('season', ['winter'], 'en');
  assert.equal(label, 'Winter');
});

// Run with: npm test   (uses Node's built-in test runner, no extra libraries)
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeListItem,
  normalizeDetails,
  filterDestinations,
  sortDestinations,
} from '../src/utils/destinations.js';
import {
  loadTrip,
  saveTrip,
  addDestination,
  removeDestination,
  isInTrip,
} from '../src/utils/tripStorage.js';

// Fake localStorage so tripStorage.js can run in Node.
function installFakeLocalStorage() {
  const data = new Map();
  globalThis.localStorage = {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
  return data;
}

// Sample items shaped like OpenTripMap's "radius" response.
const apiList = [
  { xid: 'A1', name: 'Louvre Museum', dist: 1200.4, rate: '3h', kinds: 'cultural,museums,historic' },
  { xid: 'B2', name: 'Bois Park', dist: 400, rate: '2', kinds: 'natural,gardens_and_parks' },
  { xid: 'C3', name: 'Arc de Triomphe', dist: 800, rate: '3', kinds: 'historic,architecture' },
  { xid: 'D4', name: 'Small Chapel', dist: 100, rate: '1', kinds: 'religion,churches' },
];
const destinations = apiList.map((item) => normalizeListItem(item, 'Paris, France'));

test('normalizeListItem converts API data to our shape', () => {
  const louvre = destinations[0];
  assert.equal(louvre.id, 'A1');
  assert.equal(louvre.rating, 3); // "3h" -> 3
  assert.equal(louvre.distance, 1200);
  assert.equal(louvre.category, 'Cultural');
  assert.deepEqual(louvre.kinds, ['cultural', 'museums', 'historic']);
  assert.equal(louvre.locationText, 'Paris, France');
});

test('normalizeListItem handles missing fields', () => {
  const place = normalizeListItem({ xid: 'X', name: 'Mystery' }, 'Rome, Italy');
  assert.equal(place.rating, 0);
  assert.equal(place.distance, 0);
  assert.equal(place.category, 'Place');
});

test('normalizeDetails reads image, description and address', () => {
  const place = normalizeDetails({
    xid: 'A1',
    name: 'Louvre Museum',
    rate: '3h',
    kinds: 'cultural,museums',
    address: { city: 'Paris', state: 'Île-de-France', country: 'France' },
    preview: { source: 'https://example.com/louvre.jpg' },
    wikipedia_extracts: { text: 'A famous museum.' },
    url: 'https://louvre.fr',
    point: { lat: 48.86, lon: 2.33 },
  });
  assert.equal(place.locationText, 'Paris, Île-de-France, France');
  assert.equal(place.image, 'https://example.com/louvre.jpg');
  assert.equal(place.description, 'A famous museum.');
  assert.equal(place.website, 'https://louvre.fr');
  assert.equal(place.lat, 48.86);
});

test('normalizeDetails works when most fields are missing', () => {
  const place = normalizeDetails({ xid: 'Z', name: 'Bare place' });
  assert.equal(place.image, '');
  assert.equal(place.description, '');
  assert.equal(place.locationText, 'Location not available');
});

test('filterDestinations by category', () => {
  const result = filterDestinations(destinations, 'historic', 0);
  assert.deepEqual(result.map((d) => d.id), ['A1', 'C3']);
});

test('filterDestinations by minimum rating', () => {
  const result = filterDestinations(destinations, 'all', 3);
  assert.deepEqual(result.map((d) => d.id), ['A1', 'C3']);
});

test('filterDestinations returns empty list when nothing matches', () => {
  assert.deepEqual(filterDestinations(destinations, 'sport', 0), []);
});

test('sortDestinations by name, distance and rating', () => {
  assert.deepEqual(sortDestinations(destinations, 'name').map((d) => d.id), ['C3', 'B2', 'A1', 'D4']);
  assert.deepEqual(sortDestinations(destinations, 'distance').map((d) => d.id), ['D4', 'B2', 'C3', 'A1']);
  // rating: 3,3,2,1 ; tie between A1 (1200 m) and C3 (800 m) -> closer first
  assert.deepEqual(sortDestinations(destinations, 'rating').map((d) => d.id), ['C3', 'A1', 'B2', 'D4']);
});

test('sortDestinations does not change the original array', () => {
  const before = destinations.map((d) => d.id);
  sortDestinations(destinations, 'name');
  assert.deepEqual(destinations.map((d) => d.id), before);
});

test('addDestination adds once and ignores duplicates', () => {
  let trip = [];
  trip = addDestination(trip, destinations[0]);
  trip = addDestination(trip, destinations[0]);
  trip = addDestination(trip, destinations[1]);
  assert.equal(trip.length, 2);
  assert.equal(isInTrip(trip, 'A1'), true);
  assert.equal(isInTrip(trip, 'C3'), false);
});

test('removeDestination removes only the chosen one', () => {
  const trip = [destinations[0], destinations[1]];
  const result = removeDestination(trip, 'A1');
  assert.deepEqual(result.map((d) => d.id), ['B2']);
});

test('trip survives a "page refresh" (save then load)', () => {
  installFakeLocalStorage();
  saveTrip([destinations[0], destinations[2]]);
  const reloaded = loadTrip(); // a fresh load, like after refreshing the page
  assert.deepEqual(reloaded.map((d) => d.id), ['A1', 'C3']);
});

test('loadTrip returns [] for empty or corrupted storage', () => {
  const data = installFakeLocalStorage();
  assert.deepEqual(loadTrip(), []);
  data.set('tripwise-my-trip', '{not valid json');
  assert.deepEqual(loadTrip(), []);
  data.set('tripwise-my-trip', '{"a":1}'); // valid JSON but not a list
  assert.deepEqual(loadTrip(), []);
});

test('saveTrip does not crash if storage is blocked', () => {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('blocked');
    },
  };
  assert.doesNotThrow(() => saveTrip([destinations[0]]));
});

// Everything about saving "My Trip" in the browser lives in this file.
// localStorage only stores text, so we convert with JSON.stringify / JSON.parse.

const STORAGE_KEY = 'tripwise-my-trip';

export function loadTrip() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    if (!savedText) return [];
    const saved = JSON.parse(savedText);
    return Array.isArray(saved) ? saved : [];
  } catch {
    // Corrupted data or storage blocked by the browser: start with an empty trip.
    return [];
  }
}

export function saveTrip(trip) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  } catch {
    // Storage full or blocked (e.g. private mode). The app keeps working, it just won't persist.
  }
}

// Add a destination, but never add the same one twice (compared by id).
export function addDestination(trip, destination) {
  const alreadySaved = trip.some((place) => place.id === destination.id);
  if (alreadySaved) return trip;
  return [...trip, destination];
}

export function removeDestination(trip, id) {
  return trip.filter((place) => place.id !== id);
}

export function isInTrip(trip, id) {
  return trip.some((place) => place.id === id);
}

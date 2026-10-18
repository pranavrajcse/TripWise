// Pure helper functions: they only take data in and give data out.
// Keeping them separate from React makes them easy to understand and test.

// Categories the user can pick in the filter. "value" is the word the API
// puts inside each place's "kinds" text (for example "historic,museums").
export const CATEGORIES = [
  { value: 'all', label: 'All categories' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'historic', label: 'Historic' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'museums', label: 'Museums' },
  { value: 'natural', label: 'Nature' },
  { value: 'religion', label: 'Religious sites' },
  { value: 'amusements', label: 'Amusements' },
  { value: 'sport', label: 'Sport' },
  { value: 'foods', label: 'Food' },
];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'distance', label: 'Closest to city centre' },
];

// "historic,museums,cultural" -> ["historic", "museums", "cultural"]
function splitKinds(kindsText) {
  if (!kindsText) return [];
  return kindsText.split(',').map((kind) => kind.trim()).filter(Boolean);
}

// The API gives ratings like 1, 2, 3, "3h" or 0. We only want the number.
function toRatingNumber(rate) {
  const number = parseInt(rate, 10);
  return Number.isNaN(number) ? 0 : number;
}

// Pick one friendly label to show on a card, e.g. "Historic".
export function getCategoryLabel(kinds) {
  const match = CATEGORIES.find((c) => c.value !== 'all' && kinds.includes(c.value));
  if (match) return match.label;
  if (kinds.length > 0) {
    const first = kinds[0].replace(/_/g, ' ');
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return 'Place';
}

// Turn one item from the API's "places near a point" list into our own shape.
// Using our own shape means the rest of the app does not care what the API looks like.
export function normalizeListItem(item, locationText) {
  const kinds = splitKinds(item.kinds || item.kind);
  return {
    id: item.xid,
    name: item.name,
    kinds,
    category: getCategoryLabel(kinds),
    rating: toRatingNumber(item.rate),
    distance: Math.round(item.dist || 0), // metres from the city centre
    locationText,
    image: '',
    description: '',
  };
}

// Turn the API's "details of one place" response into the same shape (plus extras).
export function normalizeDetails(data) {
  const kinds = splitKinds(data.kinds);
  const address = data.address || {};
  const town = address.city || address.town || address.village || address.county || '';
  const locationText = [town, address.state, address.country].filter(Boolean).join(', ');

  return {
    id: data.xid,
    name: data.name,
    kinds,
    category: getCategoryLabel(kinds),
    rating: toRatingNumber(data.rate),
    distance: 0,
    locationText: locationText || 'Location not available',
    image: (data.preview && data.preview.source) || data.image || '',
    description: (data.wikipedia_extracts && data.wikipedia_extracts.text) || '',
    website: data.url || '',
    wikipedia: data.wikipedia || '',
    lat: data.point ? data.point.lat : null,
    lon: data.point ? data.point.lon : null,
  };
}

// FILTERING: keep only the destinations that match the chosen category and rating.
export function filterDestinations(destinations, category, minRating) {
  return destinations.filter((place) => {
    const categoryMatches = category === 'all' || place.kinds.includes(category);
    const ratingMatches = place.rating >= minRating;
    return categoryMatches && ratingMatches;
  });
}

// SORTING: return a new sorted array (we never change the original list).
export function sortDestinations(destinations, sortBy) {
  const copy = [...destinations];
  if (sortBy === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'distance') {
    copy.sort((a, b) => a.distance - b.distance);
  } else {
    // "rating": highest first. If two have the same rating, closer one first.
    copy.sort((a, b) => b.rating - a.rating || a.distance - b.distance);
  }
  return copy;
}

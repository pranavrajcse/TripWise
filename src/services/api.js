// ALL calls to the external API live in this one file.
// API used: OpenTripMap (https://dev.opentripmap.org/docs)
// It needs a free API key, which we read from the VITE_API_KEY environment variable.

import { normalizeListItem, normalizeDetails } from '../utils/destinations.js';

const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';
const API_KEY = import.meta.env.VITE_API_KEY;

// One small helper that every API call goes through.
// It adds the key, calls fetch, and turns problems into readable error messages.
async function getJson(path, params = {}) {
  if (!API_KEY) {
    throw new Error('API key is missing. Add VITE_API_KEY to your .env file and restart the app.');
  }

  const query = new URLSearchParams({ ...params, apikey: API_KEY });
  let response;
  try {
    response = await fetch(`${BASE_URL}/${path}?${query}`);
  } catch {
    // fetch only throws when the request never got an answer (offline, blocked, etc.)
    throw new Error('Could not reach the travel service. Check your internet connection and try again.');
  }

  if (response.status === 404) return { status: 'NOT_FOUND' };
  if (response.status === 401 || response.status === 403) {
    throw new Error('The API key was rejected. Check that VITE_API_KEY is correct.');
  }
  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }
  if (!response.ok) {
    throw new Error(`The travel service had a problem (error ${response.status}). Please try again.`);
  }
  return response.json();
}

// "FR" -> "France" (built into the browser, no library needed)
function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

// Step 1: turn a city name into coordinates.   GET /geoname?name=Paris
// Step 2: find interesting places near them.   GET /radius?lat=..&lon=..
// Returns { cityLabel, destinations }. If the city is unknown, destinations is [].
export async function searchDestinations(cityName) {
  const city = await getJson('geoname', { name: cityName });
  if (city.status !== 'OK') {
    return { cityLabel: '', destinations: [] };
  }

  const cityLabel = `${city.name}, ${countryName(city.country)}`;
  const places = await getJson('radius', {
    radius: 10000, // search within 10 km of the city centre
    lon: city.lon,
    lat: city.lat,
    kinds: 'interesting_places',
    rate: 1, // skip places without any rating
    format: 'json',
    limit: 40,
  });

  // On success this is an array. Skip entries without a name (the API has many).
  const list = Array.isArray(places) ? places : [];
  const destinations = list
    .filter((item) => item.name && item.xid)
    .map((item) => normalizeListItem(item, cityLabel));

  return { cityLabel, destinations };
}

// Full information for one place.   GET /xid/{id}
// Returns null if the place does not exist.
async function fetchDetails(id) {
  const data = await getJson(`xid/${encodeURIComponent(id)}`);
  if (data.status === 'NOT_FOUND' || !data.xid) return null;
  return normalizeDetails(data);
}

// Cards AND the details page both ask for the same place, so we remember each answer.
// That way the API is called only once per place, even when cards reappear after filtering.
const detailsCache = new Map();

export function getDestinationDetails(id) {
  if (!detailsCache.has(id)) {
    const request = fetchDetails(id).catch((error) => {
      detailsCache.delete(id); // do not remember failures, so "Try again" really retries
      throw error;
    });
    detailsCache.set(id, request);
  }
  return detailsCache.get(id);
}

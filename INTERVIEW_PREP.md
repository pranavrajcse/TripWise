# TripWise – Interview Preparation

## 1. Final folder structure

```
tripwise/
├── index.html            the single HTML page; React mounts into <div id="root">
├── package.json          dependencies + scripts (dev, build, preview, test)
├── vite.config.js        enables the React plugin
├── vercel.json           sends all URLs to index.html (needed for React Router on Vercel)
├── .env.example          placeholder for the API key (the real .env is git-ignored)
├── .gitignore
├── README.md
├── tests/logic.test.mjs  tests for filter, sort, normalise, trip storage
└── src/
    ├── main.jsx          starts React + wraps the app in BrowserRouter
    ├── App.jsx           routes + holds the saved trip (state + localStorage)
    ├── index.css         all styles
    ├── services/api.js   ALL calls to the API
    ├── utils/
    │   ├── destinations.js   normalise API data, filter, sort
    │   └── tripStorage.js    load/save/add/remove trip
    ├── components/       Navbar, SearchBar, Filters, DestinationCard, StatusMessage
    └── pages/            Explore, DestinationDetails, MyTrip
```

## 2. How the whole app works

`main.jsx` starts React. `App.jsx` shows the Navbar and picks a page from the URL. The saved trip is a list kept in `App.jsx` state; it is loaded from localStorage at start and saved again whenever it changes. Pages receive the trip and the add/remove functions as props.

On **Explore**, the city in the URL (`?city=Paris`) triggers an API call. The results go into state. I filter, then sort them, and render one card for each result. **Details** loads one place by the id in the URL. **My Trip** just shows the saved list.

## 3. The API (OpenTripMap)

A free API with an API key. It has points of interest worldwide. I use three endpoints:
1. `/geoname?name=Paris` → city coordinates
2. `/radius?lat&lon&radius=10000...` → places within 10 km
3. `/xid/{id}` → full details (image, Wikipedia text, address) for one place

I chose it because it gives both a list and rich details, so no backend is needed.

## 4. How search works

The search box is a controlled input (its text lives in state). On submit, I put the city into the URL with `setSearchParams`. `Explore` has a `useEffect` that depends on `city`, so it re-runs and calls `searchDestinations(city)`. Search is therefore a real API search by city.

## 5. How filtering works

`filterDestinations(list, category, minRating)` uses `Array.filter`. A place passes if its `kinds` list includes the chosen category (or category is "all") and its rating is at least the minimum. It runs in the browser on the already-loaded results, so it's instant.

## 6. How sorting works

`sortDestinations(list, sortBy)` copies the array (`[...list]`) and calls `.sort()` with a comparison function: by rating (highest first), by name (`localeCompare`), or by distance (smallest first). I copy first because `.sort()` changes the array it is called on, and React state should not be changed directly.

## 7. How localStorage works

localStorage keeps text in the browser, with no expiry. I save with `JSON.stringify` and load with `JSON.parse`, inside `try/catch` so bad or blocked storage does not crash the app. In `App.jsx`, `useState(loadTrip)` reads it at startup and `useEffect(() => saveTrip(trip), [trip])` writes it on every change. Duplicates are prevented by checking the place id before adding.

## 8. How routing works

React Router gives each screen a URL: `/` (Explore), `/destination/:id` (Details), `/my-trip`. `:id` is read with `useParams`. `NavLink` and `Link` change pages without reloading. Because it is a single-page app, Vercel needs `vercel.json` to serve `index.html` for every URL; otherwise refreshing `/my-trip` gives a 404.

## 9. Loading, error and empty states

Each page that fetches data has `loading`, `error` and data in state. Before the request: `loading = true` → spinner. If `fetch` fails or the status is not OK → `error` set → readable message + "Try again". If the request works but the list is empty (or the filters remove everything) → "No destinations found." The screen is never blank. Cleanup in `useEffect` (`ignore` flag) prevents an old response from overwriting a newer one.

## 10. How the frontend talks to the API

Components never call `fetch` directly. They call `searchDestinations` or `getDestinationDetails` from `api.js`. Those use one helper, `getJson`, which adds the key, calls `fetch` with `async/await`, converts HTTP problems (401, 429, 500, offline) into friendly error messages, and returns JSON. Then `normalizeListItem` / `normalizeDetails` convert the response into my own simple object shape, so the UI doesn't depend on the API's field names.

## 11. Environment variables

The key lives in `.env` as `VITE_API_KEY` and is read with `import.meta.env.VITE_API_KEY`. Vite only exposes variables starting with `VITE_`. `.env` is in `.gitignore`; `.env.example` shows the format. Honest caveat: in a frontend-only app the key ends up in the built JavaScript, so it is visible in the browser. To fully hide it you would need a backend or serverless proxy, which this task excluded.

## 12. Vercel deployment

Push to GitHub → import the repo in Vercel → Build Command `npm run build`, Output Directory `dist` → add `VITE_API_KEY` in Project Settings → Environment Variables → Deploy. Redeploy after changing a variable, because Vite bakes it in at build time. `vercel.json` handles the routing rewrite.

## 13 & 14. Likely questions and simple answers

1. **Why React?** It splits the UI into reusable components and updates the screen automatically when state changes.
2. **Why Vite?** Fast dev server and simple build setup compared to older tools.
3. **What is state, and where did you use it?** Data that, when changed, makes React re-render. Examples: search results, loading, error, filter choices, and the saved trip.
4. **What does `useEffect` do here?** Runs code after render. I use it to fetch when the city changes and to save the trip to localStorage when it changes. The dependency array says when to re-run.
5. **Why is the trip state in `App.jsx`?** The Navbar counter, Explore, Details and My Trip all need it. Keeping it in their common parent lets them share it ("lifting state up").
6. **How do you avoid duplicates in My Trip?** `addDestination` checks `trip.some(p => p.id === id)` and returns the list unchanged if it exists. The button also shows "✓ Added".
7. **localStorage vs sessionStorage vs cookies?** localStorage persists until cleared; sessionStorage ends when the tab closes; cookies are sent to the server with each request and are small. I need persistence with no server, so localStorage.
8. **What happens if the API is down or the key is wrong?** `getJson` throws an Error with a friendly message; the page catches it, shows the error box and a "Try again" button.
9. **What is `async/await`?** A readable way to wait for a Promise. `await fetch(...)` pauses that function until the response arrives without freezing the page.
10. **Why a separate `api.js`?** One place to change the API, the key and error handling; components stay simple and the API can be swapped without touching the UI.
11. **Why did you "normalise" the data?** The API field names are not ideal for my UI (`rate: "3h"`, `kinds` as one string). Converting once gives consistent objects everywhere.
12. **How is the layout responsive?** CSS Grid with 1 column on mobile, 2 on tablet (600px+) and 3 on desktop (900px+) via media queries; the navbar turns into a menu button on small screens.
13. **Why React Router, and what is the Vercel issue?** I need separate URLs for details and My Trip. On refresh the server must return `index.html` for those paths, which `vercel.json` rewrites.
14. **Is your API key secure?** Not fully: it is not in the repo, but it is visible in the browser because there's no backend. It is a free key; the proper fix is a server-side proxy.
15. **What would you improve next?** Show images on cards, use a loading skeleton, add pagination, save trip days/notes, and add component tests.

## 15. "Tell me about your project" (about 1 minute)

"TripWise is a travel planner I built with React and Vite. You search for a city, and it loads real places from the OpenTripMap API: landmarks, museums, parks. They appear as cards that you can filter by category and rating and sort by rating, name or distance. You can open a details page with a photo and description, and add places to a My Trip list. That list is saved in localStorage, so it survives a refresh or closing the browser, and there's no backend or database. I handled loading, error and empty states so the screen is never blank, and the layout is responsive from phone to desktop. I kept the structure simple: all API calls are in one service file, the filter, sort and storage logic are small pure functions that I wrote tests for, and I deploy it on Vercel with the API key stored as an environment variable."

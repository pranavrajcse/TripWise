# TripWise – Smart Travel Planner

## Overview

TripWise is a small travel-planning web app. You search for a city, browse interesting places (museums, landmarks, parks…) as cards, open a details page for any place, and save the ones you like to **My Trip**. Your trip is stored in the browser, so it is still there after a refresh or after closing the browser. There is no backend and no database.

## Track

Track 1 – Frontend

## Features

- Search any city and load real places from an external API
- Destination cards with name, category, location, rating, distance, **View Details** and **Add to Trip**
- Filtering by category and minimum rating
- Sorting by rating, name (A–Z) or distance from the city centre
- Destination details page (image, description, location, types, links) with its own URL
- **My Trip** page: view saved places and remove them
- Trip saved in `localStorage` (survives refresh and browser restart); no duplicate entries
- Loading spinner, friendly API error messages with a "Try again" button, and a "No destinations found." empty state
- Responsive layout (mobile, tablet, desktop) with a mobile menu button

## Tech Stack

- **React 18** – building the UI from components
- **Vite** – dev server and build tool
- **JavaScript (ES modules)** and **CSS** (one stylesheet, no UI library)
- **Fetch API** – calling the external API
- **localStorage** – saving My Trip in the browser
- **React Router** – needed for separate pages (`/`, `/destination/:id`, `/my-trip`)

## API Used

- **Name:** [OpenTripMap](https://opentripmap.io/docs)
- **What it provides:** points of interest around the world (landmarks, museums, nature…) with ratings, categories, addresses, images and Wikipedia descriptions
- **Why:** it returns both a list of places near a location and rich details for one place, which fits "discover" + "details" without needing a backend
- **Endpoints used** (base `https://api.opentripmap.com/0.1/en/places`):
  - `GET /geoname?name={city}` – turns a city name into coordinates
  - `GET /radius?lat=..&lon=..&radius=10000&kinds=interesting_places&rate=1&format=json&limit=40` – places near those coordinates
  - `GET /xid/{id}` – full details for one place
- **API key required:** Yes (free). Get one at <https://opentripmap.io/product>

All API calls are in one file: `src/services/api.js`.

## Setup

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd tripwise
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file (copy the example)
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and replace the placeholder with your own key
5. Start the development server
   ```bash
   npm run dev
   ```
   Then open the address shown in the terminal (usually http://localhost:5173).

Other commands: `npm run build` (production build into `dist/`), `npm run preview` (try the build locally), `npm test` (runs the logic tests).

## Environment Variables

```
VITE_API_KEY=your_api_key_here
```

The `.env` file is listed in `.gitignore` and must never be committed. Only `.env.example` (placeholder value) is in the repository.

> Note: because this is a frontend-only app, Vite includes the key in the built JavaScript, so it can be seen in the browser's network tab. This is normal for free, low-risk keys like this one; a private key would need a backend.

## Project Structure

```
src/
├── components/        Reusable pieces of UI
│   ├── Navbar.jsx           top bar + mobile menu + trip counter
│   ├── SearchBar.jsx        city search box
│   ├── Filters.jsx          category / rating / sort dropdowns
│   ├── DestinationCard.jsx  one destination card
│   └── StatusMessage.jsx    loading, error and empty screens
├── pages/             One file per screen
│   ├── Explore.jsx          search + filter + sort + cards
│   ├── DestinationDetails.jsx
│   └── MyTrip.jsx
├── services/
│   └── api.js               every call to OpenTripMap
├── utils/
│   ├── destinations.js      normalising API data, filtering, sorting
│   └── tripStorage.js       localStorage load/save, add/remove
├── App.jsx            routes + the saved trip state
├── main.jsx           app entry point (starts React and the router)
└── index.css          all styling
tests/logic.test.mjs   tests for filtering, sorting, normalising and trip storage
vercel.json            makes page refreshes work on Vercel
```

## Deployment

Deploying to Vercel:

1. Push the project to GitHub (make sure `.env` is **not** included).
2. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the repository.
3. Vercel detects Vite automatically. Check these settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add `VITE_API_KEY` with your key (Project → Settings → Environment Variables).
5. Click **Deploy**. If you add or change the variable later, redeploy so the new value is built in.

`vercel.json` sends every URL to `index.html`, so refreshing on `/my-trip` or `/destination/...` does not give a 404.

## Screenshots

Add your screenshots to a `screenshots/` folder and update the links below.

| Explore (desktop) | Destination details |
| --- | --- |
| ![Explore page](screenshots/explore.png) | ![Details page](screenshots/details.png) |

| My Trip | Mobile view |
| --- | --- |
| ![My Trip page](screenshots/my-trip.png) | ![Mobile view](screenshots/mobile.png) |

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import Filters from '../components/Filters.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { searchDestinations } from '../services/api.js';
import { filterDestinations, sortDestinations } from '../utils/destinations.js';
import { isInTrip } from '../utils/tripStorage.js';

// CHANGE THE DEFAULT CITY HERE: the city shown when the app first opens
const DEFAULT_CITY = 'Puducherry';

// Each card fetches its own photo, so we show only a few cards at a time
// and add more with the "Show more" button. This keeps the number of API calls small.
const PAGE_SIZE = 12;

export default function Explore({ trip, onAdd }) {
  // The searched city is kept in the URL (?city=Rome). That way the Back button
  // from a details page returns to the same results.
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') || DEFAULT_CITY;

  // Data and status
  const [destinations, setDestinations] = useState([]);
  const [cityLabel, setCityLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Filter and sort choices
  const [category, setCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');

  // How many cards are currently shown
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Start again from the first 12 whenever the search, filters or sort change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [city, category, minRating, sortBy]);

  // Fetch from the API whenever the city changes (or the user presses "Try again").
  useEffect(() => {
    let ignore = false; // if the user searches again quickly, ignore the old answer

    async function loadDestinations() {
      setLoading(true);
      setError('');
      try {
        const result = await searchDestinations(city);
        if (ignore) return;
        setDestinations(result.destinations);
        setCityLabel(result.cityLabel);
      } catch (err) {
        if (ignore) return;
        setDestinations([]);
        setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDestinations();
    return () => {
      ignore = true;
    };
  }, [city, retryCount]);

  // First filter, then sort. These are calculated on every render from the data above.
  const visibleDestinations = sortDestinations(
    filterDestinations(destinations, category, minRating),
    sortBy
  );

  function clearFilters() {
    setCategory('all');
    setMinRating(0);
  }

  function renderResults() {
    if (loading) {
      return (
        <StatusMessage type="loading" title="Finding destinations...">
          <p className="muted">Looking for places in {city}</p>
        </StatusMessage>
      );
    }

    if (error) {
      return (
        <StatusMessage type="error" title="Something went wrong">
          <p className="muted">{error}</p>
          <button className="btn btn-primary" onClick={() => setRetryCount(retryCount + 1)}>
            Try again
          </button>
        </StatusMessage>
      );
    }

    if (destinations.length === 0) {
      return (
        <StatusMessage type="empty" title="No destinations found.">
          <p className="muted">We could not find places for “{city}”. Check the spelling or try another city.</p>
        </StatusMessage>
      );
    }

    if (visibleDestinations.length === 0) {
      return (
        <StatusMessage type="empty" title="No destinations found.">
          <p className="muted">None of the {destinations.length} places match your filters.</p>
          <button className="btn btn-outline" onClick={clearFilters}>
            Clear filters
          </button>
        </StatusMessage>
      );
    }

    return (
      <>
        <p className="result-count">
          Showing {Math.min(visibleCount, visibleDestinations.length)} of {visibleDestinations.length} places in{' '}
          {cityLabel}
        </p>
        <div className="grid">
          {visibleDestinations.slice(0, visibleCount).map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              inTrip={isInTrip(trip, destination.id)}
              onAdd={onAdd}
            />
          ))}
        </div>
        {visibleCount < visibleDestinations.length && (
          <div className="load-more">
            <button className="btn btn-outline" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
              Show more
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <h1>Plan your next trip with TripWise</h1>
        <p>Search a city, discover top places and save them to your trip.</p>
        <SearchBar
          key={city} /* new key = fresh input box when the city in the URL changes */
          initialValue={city}
          onSearch={(newCity) => setSearchParams({ city: newCity })}
        />
      </section>

      <Filters
        category={category}
        minRating={minRating}
        sortBy={sortBy}
        onCategoryChange={setCategory}
        onRatingChange={setMinRating}
        onSortChange={setSortBy}
      />

      {renderResults()}
    </>
  );
}

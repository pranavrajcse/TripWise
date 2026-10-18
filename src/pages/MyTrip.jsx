import { Link } from 'react-router-dom';
import DestinationCard from '../components/DestinationCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

// No API call here: the saved places come straight from the "trip" list (which is in localStorage).
export default function MyTrip({ trip, onRemove, onClear }) {
  // Ask first, so one accidental click cannot wipe the whole trip
  function handleClearClick() {
    if (window.confirm('Remove all destinations from your trip?')) {
      onClear();
    }
  }

  if (trip.length === 0) {
    return (
      <StatusMessage type="empty" title="Your trip is empty">
        <p className="muted">Add destinations from the Explore page and they will show up here.</p>
        <Link className="btn btn-primary" to="/">
          Explore destinations
        </Link>
      </StatusMessage>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trip</h1>
          <p className="result-count">
            {trip.length} {trip.length === 1 ? 'destination' : 'destinations'} saved
          </p>
        </div>
        <button className="btn btn-danger" onClick={handleClearClick}>
          Clear trip
        </button>
      </div>
      <div className="grid">
        {trip.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            showRemove
            onRemove={onRemove}
          />
        ))}
      </div>
    </>
  );
}

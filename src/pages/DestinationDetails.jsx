import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage.jsx';
import { getDestinationDetails } from '../services/api.js';
import { isInTrip } from '../utils/tripStorage.js';

export default function DestinationDetails({ trip, onAdd, onRemove }) {
  const { id } = useParams(); // the :id part of the URL /destination/:id
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDetails() {
      setLoading(true);
      setError('');
      try {
        const details = await getDestinationDetails(id);
        if (!ignore) setDestination(details); // null means "not found"
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      ignore = true;
    };
  }, [id, retryCount]);

  const backButton = (
    <button className="btn btn-outline back-button" onClick={() => navigate(-1)}>
      ← Back
    </button>
  );

  if (loading) {
    return (
      <StatusMessage type="loading" title="Loading details...">
        <p className="muted">Getting information about this place</p>
      </StatusMessage>
    );
  }

  if (error) {
    return (
      <>
        {backButton}
        <StatusMessage type="error" title="Could not load this place">
          <p className="muted">{error}</p>
          <button className="btn btn-primary" onClick={() => setRetryCount(retryCount + 1)}>
            Try again
          </button>
        </StatusMessage>
      </>
    );
  }

  if (!destination) {
    return (
      <>
        {backButton}
        <StatusMessage type="empty" title="Destination not found.">
          <Link className="btn btn-primary" to="/">
            Back to Explore
          </Link>
        </StatusMessage>
      </>
    );
  }

  const saved = isInTrip(trip, destination.id);

  return (
    <>
      {backButton}
      <article className="details">
        {destination.image && (
          <img
            className="details-image"
            src={destination.image}
            alt={destination.name}
            onError={(event) => {
              event.currentTarget.style.display = 'none'; // hide the picture if the link is broken
            }}
          />
        )}

        <div className="details-body">
          <span className="tag">{destination.category}</span>
          <h1>{destination.name}</h1>
          <p className="muted">📍 {destination.locationText}</p>
          <p className="muted">
            Rating: {destination.rating > 0 ? '★'.repeat(destination.rating) : 'Not rated'}
          </p>

          <h2>About</h2>
          <p>{destination.description || 'No description is available for this place.'}</p>

          {destination.kinds.length > 0 && (
            <>
              <h2>Types</h2>
              <p className="muted">{destination.kinds.map((kind) => kind.replace(/_/g, ' ')).join(' · ')}</p>
            </>
          )}

          {(destination.website || destination.wikipedia) && (
            <p className="links">
              {destination.website && (
                <a href={destination.website} target="_blank" rel="noreferrer">
                  Official website
                </a>
              )}
              {destination.wikipedia && (
                <a href={destination.wikipedia} target="_blank" rel="noreferrer">
                  Wikipedia
                </a>
              )}
            </p>
          )}

          {saved ? (
            <button className="btn btn-danger" onClick={() => onRemove(destination.id)}>
              Remove from Trip
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onAdd(destination)}>
              + Add to Trip
            </button>
          )}
        </div>
      </article>
    </>
  );
}

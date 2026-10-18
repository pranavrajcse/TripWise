import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDestinationDetails } from '../services/api.js';

// Shows one destination. Used on the Explore page and on the My Trip page.
// "showRemove" decides which button we show: Add/Added (Explore) or Remove (My Trip).
export default function DestinationCard({ destination, inTrip, onAdd, onRemove, showRemove = false }) {
  // The list from the API has no photo or description, so each card asks for them itself.
  const [extra, setExtra] = useState({ image: '', description: '' });
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    if (destination.image) return; // already have them (nothing to fetch)
    let ignore = false;

    getDestinationDetails(destination.id)
      .then((details) => {
        if (!ignore && details) {
          setExtra({ image: details.image, description: details.description });
        }
      })
      .catch(() => {
        // A missing photo is not an error worth showing: the card keeps its placeholder.
      });

    return () => {
      ignore = true;
    };
  }, [destination.id, destination.image]);

  const image = destination.image || extra.image;
  const description = destination.description || extra.description;
  const stars = destination.rating > 0 ? '★'.repeat(destination.rating) : 'Not rated';

  return (
    <article className="card">
      {image && !imageBroken ? (
        <img
          className="card-image"
          src={image}
          alt={destination.name}
          loading="lazy"
          onError={() => setImageBroken(true)}
        />
      ) : (
        <div className="card-image card-image-placeholder" aria-hidden="true">
          📍
        </div>
      )}

      <div className="card-body">
        <span className="tag">{destination.category}</span>
        <h3>{destination.name}</h3>
        <p className="muted">{destination.locationText}</p>
        <p className="muted small">
          {stars}
          {destination.distance > 0 && ` · ${(destination.distance / 1000).toFixed(1)} km from centre`}
        </p>
        {description && <p className="description">{description}</p>}

        <div className="card-actions">
          <Link className="btn btn-outline" to={`/destination/${destination.id}`}>
            View Details
          </Link>
          {showRemove ? (
            <button className="btn btn-danger" onClick={() => onRemove(destination.id)}>
              Remove
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={inTrip}
              onClick={() => onAdd(destination)}
            >
              {inTrip ? '✓ Added' : '+ Add to Trip'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

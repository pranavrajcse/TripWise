import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Explore from './pages/Explore.jsx';
import DestinationDetails from './pages/DestinationDetails.jsx';
import MyTrip from './pages/MyTrip.jsx';
import { loadTrip, saveTrip, addDestination, removeDestination } from './utils/tripStorage.js';

export default function App() {
  // The saved trip lives here, in the top-level component, so every page can share it.
  // useState(loadTrip) reads localStorage once, when the app first starts.
  const [trip, setTrip] = useState(loadTrip);

  // Every time "trip" changes, write it back to localStorage.
  useEffect(() => {
    saveTrip(trip);
  }, [trip]);

  function handleAdd(destination) {
    setTrip((currentTrip) => addDestination(currentTrip, destination));
  }

  function handleRemove(id) {
    setTrip((currentTrip) => removeDestination(currentTrip, id));
  }

  // Remove every saved destination at once (the useEffect above then saves the empty list)
  function handleClear() {
    setTrip([]);
  }

  // Pages get the trip and the functions as props.
  const tripProps = { trip, onAdd: handleAdd, onRemove: handleRemove, onClear: handleClear };

  return (
    <>
      <Navbar tripCount={trip.length} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Explore {...tripProps} />} />
          <Route path="/destination/:id" element={<DestinationDetails {...tripProps} />} />
          <Route path="/my-trip" element={<MyTrip {...tripProps} />} />
          <Route
            path="*"
            element={
              <div className="status">
                <h2>Page not found</h2>
                <Link className="btn btn-primary" to="/">
                  Back to Explore
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">TripWise – Smart Travel Planner · Place data from OpenTripMap</footer>
    </>
  );
}

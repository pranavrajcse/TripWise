import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar({ tripCount }) {
  // On phones the links are hidden behind a menu button. This remembers if it is open.
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="logo" onClick={closeMenu}>
          ✈️ TripWise
        </Link>

        <button
          className="menu-button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end onClick={closeMenu}>
            Explore
          </NavLink>
          <NavLink to="/my-trip" onClick={closeMenu}>
            My Trip <span className="badge">{tripCount}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

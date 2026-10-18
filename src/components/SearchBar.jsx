import { useState } from 'react';

// A controlled input: React state ("text") always holds what is typed in the box.
// The parent only hears about it when the user submits (Enter or the Search button).
export default function SearchBar({ initialValue, onSearch }) {
  const [text, setText] = useState(initialValue);

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    const trimmed = text.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search a city, e.g. Rome, Tokyo, Paris"
        aria-label="Search a city"
      />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}

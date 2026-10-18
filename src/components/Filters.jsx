import { CATEGORIES, SORT_OPTIONS } from '../utils/destinations.js';

// Three dropdowns. This component stores nothing itself:
// it shows the values it is given and tells the parent when one changes.
export default function Filters({ category, minRating, sortBy, onCategoryChange, onRatingChange, onSortChange }) {
  return (
    <div className="filters">
      <label>
        Category
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          {CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Minimum rating
        <select value={minRating} onChange={(event) => onRatingChange(Number(event.target.value))}>
          <option value={0}>Any rating</option>
          <option value={2}>★★ and above</option>
          <option value={3}>★★★ only</option>
        </select>
      </label>

      <label>
        Sort by
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

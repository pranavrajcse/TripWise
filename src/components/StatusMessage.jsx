// One small component for the three "not normal" screens: loading, error and empty.
// type = "loading" | "error" | "empty"
export default function StatusMessage({ type, title, children }) {
  return (
    <div className={`status status-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {type === 'loading' && <div className="spinner" aria-hidden="true" />}
      {type === 'error' && <div className="status-icon">⚠️</div>}
      {type === 'empty' && <div className="status-icon">🧭</div>}
      <h2>{title}</h2>
      {children}
    </div>
  );
}

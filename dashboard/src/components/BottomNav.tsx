import { PAGES } from '../data';
import type { Dash } from '../useDashboard';

/** Replaces the sidebar below 900px. */
export default function BottomNav({ dash }: { dash: Dash }) {
  const { page, alerts } = dash.state;
  return (
    <>
      <div className="bottom-spacer" />
      <nav className="bottom-nav">
        {PAGES.map((p) => (
          <button key={p} className={page === p ? 'active' : undefined} onClick={() => dash.go(p)}>
            {p}<span className="nav-badge">{p === 'Alerts' && alerts.length ? alerts.length : ''}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

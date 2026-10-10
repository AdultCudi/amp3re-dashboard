import { PAGES } from '../data';
import { liveStatus, timeOf } from '../selectors';
import type { Dash } from '../useDashboard';

export default function Sidebar({ dash }: { dash: Dash }) {
  const s = dash.state;
  const { lost } = liveStatus(s);
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">amp3re</div>
      </div>
      <nav className="nav">
        {PAGES.map((p) => (
          <button key={p} className={'nav-item' + (s.page === p ? ' active' : '')} onClick={() => dash.go(p)}>
            <span>{p}</span>
            <span className="nav-badge">{p === 'Alerts' && s.alerts.length ? s.alerts.length : ''}</span>
          </button>
        ))}
      </nav>
      <div className="cluster">
        <div className="label-caps">Edge cluster</div>
        <div className="cluster-row"><span className="dot" style={{ background: lost ? 'var(--crit)' : 'var(--ok)' }} />{lost ? 'MTY-04 · disconnected' : 'MTY-04 · 3 nodes'}</div>
        <div className="mono muted" style={{ fontSize: 12 }}>{lost ? 'Last sync ' + timeOf(s.lastSync) : 'Cloud sync 4s ago'}</div>
      </div>
    </aside>
  );
}

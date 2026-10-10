import { PAGES } from '../data';
import type { Dash } from '../useDashboard';

export default function Sidebar({ dash }: { dash: Dash }) {
  const { page, alerts } = dash.state;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">amp3re</div>
      </div>
      <nav className="nav">
        {PAGES.map((p) => (
          <button key={p} className={'nav-item' + (page === p ? ' active' : '')} onClick={() => dash.go(p)}>
            <span>{p}</span>
            <span className="nav-badge">{p === 'Alerts' && alerts.length ? alerts.length : ''}</span>
          </button>
        ))}
      </nav>
      <div className="cluster">
        <div className="label-caps">Edge cluster</div>
        <div className="cluster-row"><span className="dot" style={{ background: '#3ecf8e' }} />MTY-04 · 3 nodes</div>
        <div className="mono muted" style={{ fontSize: 12 }}>Cloud sync 4s ago</div>
      </div>
    </aside>
  );
}

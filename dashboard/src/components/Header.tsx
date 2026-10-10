import { liveStatus, timeOf } from '../selectors';
import type { Dash } from '../useDashboard';

export default function Header({ dash, title }: { dash: Dash; title: string }) {
  const s = dash.state;
  const live = liveStatus(s);
  return (
    <header className="topbar">
      <div className="title-group">
        {s.narrow && <div className="brand-mark lg">A</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="eyebrow">Plant 04 · Monterrey, MX</div>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="pill"><span className="dot" style={{ background: live.dot }} />{live.label}</div>
        <div style={{ padding: '8px 12px', border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
          Shift 2 · <span style={{ color: 'var(--ink)' }}>{timeOf(s.now)}</span>
        </div>
        <button className="btn-quiet" onClick={() => dash.set((st) => ({ theme: st.theme === 'dark' ? 'light' : 'dark' }))}>
          {s.theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button className="btn-quiet" onClick={() => { dash.set({ tv: true }); window.scrollTo(0, 0); }}>Control room</button>
        <button className="btn-primary" onClick={() => dash.set((st) => ({ live: !st.live }))}>{s.live ? 'Pause stream' : 'Resume stream'}</button>
      </div>
    </header>
  );
}

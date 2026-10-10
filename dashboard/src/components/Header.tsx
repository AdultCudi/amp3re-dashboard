import type { Dash } from '../useDashboard';

export const liveLabel = (live: boolean, interval: number) => (live ? 'Live · ' + interval / 1000 + 's' : 'Paused');

export default function Header({ dash, title }: { dash: Dash; title: string }) {
  const { live, interval, now } = dash.state;
  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return (
    <header className="topbar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="eyebrow">Plant 04 · Monterrey, MX</div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="pill"><span className="dot" style={{ background: live ? '#3ecf8e' : '#5d636a' }} />{liveLabel(live, interval)}</div>
        <div style={{ padding: '8px 12px', border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>Shift 2 · <span style={{ color: 'var(--text)' }}>{clock}</span></div>
        <button className="btn-primary" onClick={() => dash.set((s) => ({ live: !s.live }))}>{live ? 'Pause stream' : 'Resume stream'}</button>
      </div>
    </header>
  );
}

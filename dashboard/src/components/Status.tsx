import { timeOf } from '../selectors';
import type { Dash } from '../useDashboard';

export function OutageBanner({ dash }: { dash: Dash }) {
  const s = dash.state;
  if (s.conn === 'ok') return null;
  const retrying = s.conn === 'retrying';
  return (
    <div className="banner" role="alert">
      <div className="banner-text">
        <span />
        {retrying ? 'Reconnecting to edge cluster MTY-04…' : 'Connection to edge cluster MTY-04 lost. Showing last known values from ' + timeOf(s.lastSync) + '.'}
      </div>
      <button className="btn-quiet" onClick={dash.retry} disabled={retrying}>{retrying ? 'Retrying…' : 'Retry now'}</button>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="page" aria-busy="true">
      <div className="mono muted" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
        <span className="dot" style={{ background: 'var(--warn)' }} />Connecting to edge cluster MTY-04 · syncing 108 devices…
      </div>
      <div className="skel-kpis">
        {Array.from({ length: 5 }, (_, i) => <div key={i} className="skel-kpi"><span /><span /><span /></div>)}
      </div>
      <div className="row">
        <div className="skel-block" style={{ flex: '2 1 600px' }} />
        <div className="skel-block" style={{ flex: '1 1 300px' }} />
      </div>
    </div>
  );
}

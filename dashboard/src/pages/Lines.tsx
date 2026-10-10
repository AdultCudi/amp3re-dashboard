import { LINES, LINE_NAMES, LINE_OEE, LINE_UNITS, PROTO, STATUS, avgOf, isOff } from '../data';
import type { Dash } from '../useDashboard';

export default function Lines({ dash }: { dash: Dash }) {
  const devs = dash.state.devices;
  return (
    <div className="page">
      <div className="line-cards">
        {LINES.map((L) => {
          const ds = devs.filter((d) => d.line === L);
          const up = ds.filter((d) => !isOff(d));
          const bad = ds.filter((d) => d.status !== 'online').length;
          const stats: [string, string | number][] = [
            ['Online', up.length + ' / ' + ds.length],
            ['OEE', LINE_OEE[L].toFixed(1) + '%'],
            ['Units/hr', LINE_UNITS[L]],
            ['Avg temp', avgOf(ds, 'temp').toFixed(1) + '°'],
            ['Avg CPU', Math.round(avgOf(ds, 'cpu')) + '%'],
            ['Latency', avgOf(ds, 'latency').toFixed(1) + ' ms'],
          ];
          return (
            <button key={L} className="line-card" onClick={() => dash.go('Devices', { line: L, status: 'All', query: '' })}>
              <div className="panel-head">
                <div className="stack-2">
                  <span className="mono" style={{ fontSize: 15, fontWeight: 500 }}>Line {L}</span>
                  <span className="panel-sub">{LINE_NAMES[L]}</span>
                </div>
                <span className="proto-tag">{PROTO[L]}</span>
              </div>
              <div className="line-card-body">
                <div className="floor-grid">
                  {ds.map((d) => <span key={d.id} style={{ aspectRatio: '1', background: d.status === 'offline' ? '#2a2f34' : STATUS[d.status][0] }} />)}
                </div>
                <div className="line-stats">
                  {stats.map(([k, v]) => <div key={k} className="line-stat"><span>{k}</span><span>{v}</span></div>)}
                </div>
                <div className="line-foot">
                  <span style={{ color: bad ? '#f0a43a' : '#3ecf8e' }}>{bad ? bad + ' need attention' : 'All healthy'}</span>
                  <span className="muted">View devices →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

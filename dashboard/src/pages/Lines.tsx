import { CELL, GLYPH, LINES, LINE_NAMES, LINE_OEE, LINE_UNITS, PROTO, avgOf, isOff } from '../data';
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
          const stats: [string, string | number, string?][] = [
            ['Online', up.length + ' / ' + ds.length],
            ['OEE', LINE_OEE[L].toFixed(1) + '%', LINE_OEE[L] < 85 ? 'var(--warn)' : undefined],
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
                  {ds.map((d) => <span key={d.id} className="mini-cell" style={{ background: CELL[d.status] }}>{GLYPH[d.status]}</span>)}
                </div>
                <div className="line-stats">
                  {stats.map(([k, v, c]) => <div key={k} className="line-stat"><span>{k}</span><span style={c ? { color: c } : undefined}>{v}</span></div>)}
                </div>
                <div className="line-foot">
                  <span style={{ color: bad ? 'var(--warn)' : 'var(--ok)' }}>{bad ? bad + ' need attention' : 'All healthy'}</span>
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

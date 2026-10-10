import { GLYPH, LINES, LINE_NAMES, SEV } from '../data';
import { FLOOR_LEGENDS, cellColor, fleetKpis, liveStatus, timeOf } from '../selectors';
import type { Dash } from '../useDashboard';

const METRIC_LABEL = { status: 'status', temperature: 'temperature', cpu: 'CPU load' };

/** Full-screen wall display. Esc or the Exit button returns to the dashboard. */
export default function ControlRoom({ dash }: { dash: Dash }) {
  const s = dash.state;
  const k = fleetKpis(s);
  const live = liveStatus(s);
  const kpis: [string, string | number, string, string?][] = [
    ['Devices online', k.online.toLocaleString(), ' / ' + k.total],
    ['Latency p95', k.p95.toFixed(1), ' ms', k.overSla ? 'var(--crit)' : 'var(--muted)'],
    ['Plant OEE', s.oee.toFixed(1), ' %'],
    ['Edge data · 24h', s.data.toFixed(2), ' TB'],
    ['Open alerts', s.alerts.length, '', k.crit ? 'var(--crit)' : 'var(--ink)'],
  ];
  return (
    <div className="tv">
      <div className="tv-top">
        <div className="tv-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="brand-mark">A</div>
            <span className="mono" style={{ fontWeight: 600, fontSize: 26 }}>amp3re</span>
          </div>
          <span style={{ width: 1, height: 32, background: 'var(--line)' }} />
          <span style={{ fontSize: 26 }}>Plant 04 · Monterrey</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: live.dot }} />{live.label}
          </div>
          <span className="mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-.02em' }}>{timeOf(s.now)}</span>
          <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: 14 }} onClick={() => dash.set({ tv: false })}>Exit · Esc</button>
        </div>
      </div>

      <div className="tv-kpis">
        {kpis.map(([label, value, unit, color]) => (
          <div key={label} className="tv-kpi">
            <div>{label}</div>
            <div style={color ? { color } : undefined}>{value}<span className="unit">{unit}</span></div>
          </div>
        ))}
      </div>

      <div className="tv-main">
        <section className="panel" style={{ display: 'grid', gridTemplateRows: 'auto minmax(0,1fr) auto' }}>
          <div className="tv-head">
            <span style={{ fontSize: 24, fontWeight: 500 }}>Plant floor</span>
            <span className="muted" style={{ fontSize: 17 }}>Colored by {METRIC_LABEL[s.metric]} · rotates every 10s</span>
          </div>
          <div className="tv-floor">
            {LINES.map((L) => (
              <div key={L} className="tv-line">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 500 }}>Line {L}</span>
                  <span className="muted" style={{ fontSize: 16 }}>{LINE_NAMES[L]}</span>
                </div>
                <div className="tv-cells">
                  {s.devices.filter((d) => d.line === L).map((d) => (
                    <span key={d.id} style={{ background: cellColor(d, s.metric) }}>{GLYPH[d.status]}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: '0 24px 20px 190px' }}>
            {FLOOR_LEGENDS[s.metric].map((l) => (
              <div key={l.label} className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                <span style={{ width: 14, height: 14, background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </section>

        <section className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="tv-head">
            <span style={{ fontSize: 24, fontWeight: 500 }}>Open alerts</span>
            <span className="mono muted" style={{ fontSize: 18 }}>{s.alerts.length}</span>
          </div>
          {s.alerts.slice(0, 6).map((a) => (
            <div key={a.id} className="tv-alert">
              <span style={{ background: SEV[a.sev][0] }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 20 }}>{a.title}</span>
                <span className="mono muted" style={{ fontSize: 15 }}>{SEV[a.sev][1]} · {a.meta}</span>
              </div>
            </div>
          ))}
          {s.alerts.length === 0 && <div style={{ padding: '32px 24px', fontSize: 22, color: 'var(--ok)' }}>All clear</div>}
        </section>
      </div>
    </div>
  );
}

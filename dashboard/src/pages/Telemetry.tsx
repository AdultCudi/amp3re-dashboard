import { LINES, LINE_NAMES, LINE_UNITS, avgOf, type TelMetric } from '../data';
import type { Dash } from '../useDashboard';
import { liveLabel } from '../components/Header';
import { AXIS_X, PanelHead, Tabs } from '../components/ui';

const TABS: [TelMetric, string][] = [['latency', 'Latency'], ['throughput', 'Throughput'], ['cpu', 'CPU'], ['temp', 'Temperature']];

export default function Telemetry({ dash }: { dash: Dash }) {
  const s = dash.state;
  const TM: Record<TelMetric, [string, string, number[], number]> = {
    latency: ['Latency p95', 'ms', s.lat, 1],
    throughput: ['Throughput', 'units/hr', s.thr, 0],
    cpu: ['Avg CPU', '%', s.cpuS, 0],
    temp: ['Avg SoC temp', '°C', s.tempS, 1],
  };
  const [title, unit, ts, digits] = TM[s.telMetric];
  const n = ts.length;
  const mn = Math.min(...ts), mx = Math.max(...ts), av = ts.reduce((a, b) => a + b, 0) / n;
  const pad = (mx - mn) * 0.2 || 1, lo = mn - pad, hi = mx + pad;
  const Y = (v: number) => (260 - (v - lo) / (hi - lo) * 260).toFixed(1);
  const X = (i: number) => (i / (n - 1) * 600).toFixed(1);
  const f = (v: number) => v.toFixed(digits);

  const byKey = s.telMetric === 'throughput' ? null : s.telMetric;
  const byLine = LINES.map((L) => ({ id: L, name: LINE_NAMES[L], v: byKey ? avgOf(s.devices.filter((d) => d.line === L), byKey) : LINE_UNITS[L] }));
  const bmax = Math.max(...byLine.map((b) => b.v));

  const stats: [string, number][] = [['Current', ts[n - 1]], ['Min · 60 min', mn], ['Avg · 60 min', av], ['Max · 60 min', mx]];

  return (
    <div className="page">
      <Tabs className="lg" options={TABS} value={s.telMetric} onChange={(telMetric) => dash.set({ telMetric })} />
      <section className="tel-stats">
        {stats.map(([label, v]) => (
          <div key={label} className="tel-stat">
            <div className="label-caps">{label}</div>
            <div className="kpi-value">{s.telMetric === 'throughput' ? Math.round(v).toLocaleString() : f(v)}<span className="unit"> {unit}</span></div>
          </div>
        ))}
      </section>
      <div className="row">
        <section className="panel wide">
          <PanelHead title={title + ' · last 60 min'}><div className="panel-meta">{liveLabel(s.live, s.interval)}</div></PanelHead>
          <div className="tel-chart">
            <div className="axis-y"><span>{f(hi)}</span><span>{f((hi + lo) / 2)}</span><span>{f(lo)}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <svg className="chart" viewBox="0 0 600 260" preserveAspectRatio="none" style={{ height: 260 }}>
                <line x1="0" y1="1" x2="600" y2="1" stroke="#24292e" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="#24292e" strokeWidth="1" />
                <line x1="0" y1="259" x2="600" y2="259" stroke="#24292e" strokeWidth="1" />
                <path d={'M0,260 ' + ts.map((v, i) => 'L' + X(i) + ',' + Y(v)).join(' ') + ' L600,260 Z'} fill="#d7f54a" opacity=".08" />
                <polyline points={ts.map((v, i) => X(i) + ',' + Y(v)).join(' ')} fill="none" stroke="#d7f54a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              {AXIS_X}
            </div>
          </div>
        </section>
        <section className="panel side">
          <PanelHead title="By line"><div className="panel-meta">{unit}</div></PanelHead>
          <div className="bars sm">
            {byLine.map((b) => (
              <div key={b.id} className="bar-item">
                <div className="bar-head"><span>Line {b.id} · <span className="muted">{b.name}</span></span><span className="mono">{byKey ? f(b.v) : String(b.v)}</span></div>
                <div className="track"><div style={{ width: (b.v / bmax * 100).toFixed(1) + '%', background: '#2f7fa6' }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

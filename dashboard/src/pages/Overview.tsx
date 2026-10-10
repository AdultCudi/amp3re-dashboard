import { GLYPH, LINES, LINE_NAMES, PROTO, SEV, STATUS, type FloorMetric } from '../data';
import { FLOOR_LEGENDS, LINE_OPTIONS, cellColor, fleetKpis, rolloutStages } from '../selectors';
import type { Dash } from '../useDashboard';
import { AXIS_X, Bar, Chips, PanelHead, StatusCell } from '../components/ui';

const METRIC_TABS: [FloorMetric, string][] = [['status', 'Status'], ['temperature', 'Temp'], ['cpu', 'CPU']];
const STATUS_RANK = { offline: 0, degraded: 1, rebooting: 2, online: 3 };

export default function Overview({ dash }: { dash: Dash }) {
  const s = dash.state;
  const devs = s.devices;
  const sel = devs.find((d) => d.id === s.sel) ?? devs[0];
  const selOff = sel.status === 'offline' || sel.status === 'rebooting';

  const { online, p95, overSla, crit } = fleetKpis(s);

  const W = 600, H = 180, n = s.lat.length;
  const latPoints = s.lat.map((v, i) => (i / (n - 1) * W).toFixed(1) + ',' + (H - v / 20 * H * 0.8 - 10).toFixed(1)).join(' ');
  const thrPath = 'M0,' + H + ' ' + s.thr.map((v, i) => 'L' + (i / (n - 1) * W).toFixed(1) + ',' + (H - (v - 800) / 500 * H * 0.75).toFixed(1)).join(' ') + ' L' + W + ',' + H + ' Z';

  const attention = devs
    .filter((d) => s.line === 'All' || d.line === s.line)
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.temp - a.temp)
    .slice(0, 8);

  return (
    <div className="page">
      <section className="kpis">
        <div className="kpi">
          <div className="label-caps">Devices online</div>
          <div className="kpi-value">{online.toLocaleString()}<span className="unit"> / {devs.length}</span></div>
          <div className="kpi-note">{(online / devs.length * 100).toFixed(1)}% availability</div>
        </div>
        <div className="kpi">
          <div className="label-caps">Edge latency p95</div>
          <div className="kpi-value">{p95.toFixed(1)}<span className="unit"> ms</span></div>
          <div className="gauge">
            <div style={{ width: Math.min(100, p95 / (s.sla * 2) * 100).toFixed(1) + '%', background: overSla ? 'var(--crit)' : 'var(--muted)' }} />
            <span style={{ left: '50%' }} title={'SLA ' + s.sla + ' ms'} />
          </div>
          <div className="kpi-note" style={{ color: overSla ? 'var(--crit)' : 'var(--muted)' }}>{(overSla ? 'Over ' : 'Within ') + s.sla} ms SLA</div>
        </div>
        <div className="kpi">
          <div className="label-caps">Plant OEE</div>
          <div className="kpi-value">{s.oee.toFixed(1)}<span className="unit"> %</span></div>
          <div className="gauge">
            <div style={{ width: s.oee.toFixed(1) + '%', background: s.oee < 85 ? 'var(--warn)' : 'var(--muted)' }} />
            <span style={{ left: '85%' }} title="Target 85%" />
          </div>
          <div className="kpi-note" style={{ color: 'var(--ok)' }}>Target 85 · +1.2 vs. last shift</div>
        </div>
        <div className="kpi">
          <div className="label-caps">Processed at edge · 24h</div>
          <div className="kpi-value">{s.data.toFixed(2)}<span className="unit"> TB</span></div>
          <div className="kpi-note">96.8% never left the plant</div>
        </div>
        <div className="kpi">
          <div className="label-caps">Open alerts</div>
          <div className="kpi-value" style={{ color: crit ? 'var(--crit)' : 'var(--ink)' }}>{s.alerts.length}</div>
          <div className="kpi-note">{crit} critical</div>
        </div>
      </section>

      <div className="row">
        <section className="panel wide">
          <PanelHead title="Plant floor" sub="6 lines · 108 edge devices · click a station">
            <div className="tabs">
              {METRIC_TABS.map(([k, l]) => (
                <button key={k} className={'tab' + (s.metric === k ? ' active' : '')} onClick={() => dash.set({ metric: k })}>{l}</button>
              ))}
            </div>
          </PanelHead>
          <div className="floor">
            {LINES.map((L) => (
              <div key={L} className="floor-line" style={{ gridTemplateColumns: s.narrow ? '52px minmax(0,1fr)' : undefined, opacity: s.line === 'All' || s.line === L ? 1 : 0.25 }}>
                <div className="stack-2" style={{ gap: 1 }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>Line {L}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{LINE_NAMES[L]}</span>
                </div>
                <div className="floor-grid">
                  {devs.filter((d) => d.line === L).map((d) => (
                    <button
                      key={d.id}
                      className="cell"
                      title={d.id + ' · ' + d.model + ' · ' + STATUS[d.status][1]}
                      aria-label={d.id}
                      onClick={() => dash.set({ sel: d.id })}
                      style={{ background: cellColor(d, s.metric), boxShadow: d.id === sel.id ? '0 0 0 2px var(--panel), 0 0 0 4px var(--ink)' : 'none' }}
                    >{GLYPH[d.status]}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="legend">
              {FLOOR_LEGENDS[s.metric].map((l) => (
                <div key={l.label} className="legend-item"><span className="swatch" style={{ background: l.color }} />{l.label}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel side">
          <div className="panel-head" style={{ flexWrap: 'nowrap' }}>
            <div className="mono" style={{ fontSize: 15, fontWeight: 500 }}>{sel.id}</div>
            <div className="status-tag" style={{ borderColor: STATUS[sel.status][0], color: STATUS[sel.status][0] }}>{STATUS[sel.status][1]}</div>
          </div>
          <div className="detail">
            <div className="stack-2">
              <div style={{ fontSize: 15 }}>{sel.model}</div>
              <div className="panel-sub">Line {sel.line} · {LINE_NAMES[sel.line]} · Station {sel.station}</div>
            </div>
            <div className="metric-grid">
              <Metric label="CPU" value={selOff ? '—' : Math.round(sel.cpu)} unit="%" />
              <Metric label="SoC temp" value={selOff ? '—' : sel.temp.toFixed(1)} unit="°C" />
              <Metric label="Inference latency" value={selOff ? '—' : sel.latency.toFixed(1)} unit="ms" />
              <Metric label="Uptime" value={sel.status === 'rebooting' ? 0 : sel.uptime} unit="d" />
            </div>
            <div className="kv">
              <div><span className="muted">Firmware</span><span className="mono">{sel.fw}</span></div>
              <div><span className="muted">Address</span><span className="mono">{sel.ip}</span></div>
              <div><span className="muted">Protocol</span><span className="mono">{PROTO[sel.line]}</span></div>
            </div>
            <div className="detail-actions">
              <button className="btn-outline" onClick={() => dash.reboot(sel.id)}>{sel.status === 'rebooting' ? 'Rebooting…' : 'Reboot device'}</button>
              <button className="btn-light" onClick={() => dash.go('Telemetry')}>Open telemetry</button>
            </div>
          </div>
        </section>
      </div>

      <div className="row">
        <section className="panel wide">
          <PanelHead title="Throughput & edge latency">
            <div className="chart-legend">
              <div><span style={{ width: 12, height: 2, background: 'var(--ink)' }} />Latency p95 <span className="mono" style={{ color: 'var(--ink)' }}>{s.lat[n - 1].toFixed(1)} ms</span></div>
              <div><span style={{ width: 10, height: 10, background: 'var(--dim)' }} />Units/hr <span className="mono" style={{ color: 'var(--ink)' }}>{Math.round(s.thr[n - 1]).toLocaleString()}</span></div>
            </div>
          </PanelHead>
          <div className="chart-body">
            <svg className="chart" viewBox="0 0 600 180" preserveAspectRatio="none" style={{ height: 200 }}>
              <line x1="0" y1="45" x2="600" y2="45" style={{ stroke: 'var(--line)' }} strokeWidth="1" />
              <line x1="0" y1="90" x2="600" y2="90" style={{ stroke: 'var(--line)' }} strokeWidth="1" />
              <line x1="0" y1="135" x2="600" y2="135" style={{ stroke: 'var(--line)' }} strokeWidth="1" />
              <line x1="0" y1="60" x2="600" y2="60" style={{ stroke: 'var(--crit)' }} strokeWidth="1" strokeDasharray="4 4" opacity=".6" />
              <path d={thrPath} style={{ fill: 'var(--dim)' }} opacity=".35" />
              <polyline points={latPoints} fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            {AXIS_X}
            <div className="chart-note">Dashed line: 15 ms SLA threshold</div>
          </div>
        </section>

        <section className="panel side">
          <div className="panel-head" style={{ flexWrap: 'nowrap' }}>
            <div className="panel-title">Alerts</div>
            <div className="panel-meta">{s.alerts.length} open</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {s.alerts.map((a) => (
              <div key={a.id} className="alert-row">
                <span className="alert-bar" style={{ background: SEV[a.sev][0] }} />
                <div className="alert-text"><span className="alert-title">{a.title}</span><span className="alert-meta"><span style={{ color: SEV[a.sev][0] }}>{SEV[a.sev][1]}</span> · {a.meta}</span></div>
                <button className="btn-ghost" style={{ padding: '5px 9px' }} onClick={() => dash.ack(a.id)}>Ack</button>
              </div>
            ))}
            {s.alerts.length === 0 && <div className="empty">All clear. No open alerts.</div>}
          </div>
        </section>
      </div>

      <div className="row">
        <section className="panel wide">
          <PanelHead title="Devices needing attention">
            <Chips options={LINE_OPTIONS} value={s.line} onChange={(line) => dash.set({ line })} />
          </PanelHead>
          <div className="table-scroll">
            <div style={{ minWidth: 640 }}>
              <div className="trow head attn-grid">
                <span>Device</span><span>Model</span><span>Status</span><span>CPU</span><span>Temp</span><span>Latency</span><span>FW</span>
              </div>
              {attention.map((d) => {
                const off = d.status === 'offline' || d.status === 'rebooting';
                return (
                  <div key={d.id} className={'trow click attn-grid' + (d.id === sel.id ? ' selected' : '')} onClick={() => dash.set({ sel: d.id })}>
                    <span className="mono">{d.id}</span>
                    <span className="muted">{d.model}</span>
                    <StatusCell status={d.status} />
                    <span className="mono">{off ? '—' : Math.round(d.cpu) + '%'}</span>
                    <span className="mono">{off ? '—' : d.temp.toFixed(1) + '°'}</span>
                    <span className="mono">{off ? '—' : d.latency.toFixed(1) + ' ms'}</span>
                    <span className="mono muted">{d.fw}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="panel side">
          <div className="panel-head" style={{ flexWrap: 'nowrap' }}>
            <div className="panel-title">OTA rollout</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent-ink)' }}>fw 4.2.1</div>
          </div>
          <div className="bars">
            {rolloutStages(s.rollCD).map((r) => <Bar key={r.label} {...r} />)}
            <div className="note">Staged by line during changeovers. Auto-rollback if inference latency rises above 15 ms.</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}<span className="unit"> {unit}</span></span>
    </div>
  );
}

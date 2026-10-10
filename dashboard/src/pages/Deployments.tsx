import { RELEASES } from '../data';
import { rolloutStages } from '../selectors';
import type { Dash } from '../useDashboard';
import { Bar, PanelHead } from '../components/ui';

export default function Deployments({ dash }: { dash: Dash }) {
  const s = dash.state;
  const counts: Record<string, number> = {};
  s.devices.forEach((d) => { counts[d.fw] = (counts[d.fw] || 0) + 1; });
  const releases = [
    { version: '4.2.1', date: 'Oct 8, 2026', notes: 'Vision model v7, OPC UA reconnect fix', status: s.rollPaused ? 'Paused' : 'Rolling out', color: s.rollPaused ? 'var(--warn)' : 'var(--accent)' },
    ...RELEASES,
  ];

  return (
    <div className="page">
      <div className="row">
        <section className="panel wide">
          <PanelHead title="Rollout · fw 4.2.1" sub="Started Oct 8, 2026 · staged by line during changeovers">
            <button className="btn-primary" onClick={() => dash.set((st) => ({ rollPaused: !st.rollPaused }))}>{s.rollPaused ? 'Resume rollout' : 'Pause rollout'}</button>
          </PanelHead>
          <div className="bars lg">
            {rolloutStages(s.rollCD).map((r) => <Bar key={r.label} {...r} />)}
            <div className="note" style={{ lineHeight: 'normal' }}>Auto-rollback if inference latency rises above the SLA threshold.</div>
          </div>
        </section>
        <section className="panel side">
          <PanelHead title="Firmware in fleet"><div className="panel-meta">{s.devices.length} devices</div></PanelHead>
          <div className="bars md">
            {Object.keys(counts).sort().reverse().map((v) => (
              <Bar key={v} mono label={v} status={counts[v] + ' devices'} width={(counts[v] / s.devices.length * 100).toFixed(1) + '%'} color={v === '4.2.1' ? 'var(--muted)' : 'var(--normal)'} />
            ))}
          </div>
        </section>
      </div>
      <section className="panel">
        <PanelHead title="Release history" />
        {releases.map((r) => (
          <div key={r.version} className="trow rel-grid">
            <span className="mono">{r.version}</span>
            <span className="muted">{r.date}</span>
            <span>{r.notes}</span>
            <span className="mono" style={{ fontSize: 12, color: r.color, textAlign: 'right' }}>{r.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

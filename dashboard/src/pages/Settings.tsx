import { TOGGLES } from '../data';
import type { Dash } from '../useDashboard';
import { PanelHead, Tabs } from '../components/ui';

export default function Settings({ dash }: { dash: Dash }) {
  const s = dash.state;
  return (
    <div className="page narrow">
      <section className="panel">
        <PanelHead title="Plant" />
        <div className="form-grid">
          <label className="field">Plant name
            <input className="input" value={s.plantName} onChange={(e) => dash.set({ plantName: e.target.value, saved: false })} />
          </label>
          <label className="field">Time zone
            <input className="input" value="America/Monterrey (UTC−6)" readOnly />
          </label>
        </div>
      </section>
      <section className="panel">
        <PanelHead title="Telemetry" />
        <div className="setting-list">
          <div className="setting">
            <div className="stack-2"><span className="setting-name">Stream interval</span><span className="panel-sub">How often the dashboard pulls from the edge cluster</span></div>
            <Tabs options={[[1000, '1s'], [2000, '2s'], [5000, '5s']]} value={s.interval} onChange={(interval) => dash.set({ interval, saved: false })} />
          </div>
          <div className="setting">
            <div className="stack-2"><span className="setting-name">Latency SLA</span><span className="panel-sub">p95 threshold used for alerts and auto-rollback</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input className="num-input" type="number" value={s.sla} onChange={(e) => dash.set({ sla: Math.max(1, Number(e.target.value) || 1), saved: false })} />
              <span className="mono muted" style={{ fontSize: 13 }}>ms</span>
            </div>
          </div>
        </div>
      </section>
      <section className="panel">
        <PanelHead title="Notifications & firmware" />
        <div className="toggle-list">
          {TOGGLES.map(([k, label, desc]) => (
            <div key={k} className="toggle-row">
              <div className="stack-2"><span className="setting-name">{label}</span><span className="panel-sub">{desc}</span></div>
              <button
                className={'switch' + (s.toggles[k] ? ' on' : '')}
                role="switch"
                aria-checked={s.toggles[k]}
                aria-label={label}
                onClick={() => dash.set((st) => ({ toggles: { ...st.toggles, [k]: !st.toggles[k] }, saved: false }))}
              ><span /></button>
            </div>
          ))}
        </div>
      </section>
      <div className="save-row">
        <span className="saved">{s.saved ? 'Saved' : ''}</span>
        <button className="btn-primary" onClick={() => dash.set({ saved: true })}>Save changes</button>
      </div>
    </div>
  );
}

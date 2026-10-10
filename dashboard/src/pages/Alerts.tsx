import { SEV, type Severity } from '../data';
import type { Dash } from '../useDashboard';
import { Chips, PanelHead } from '../components/ui';

const SEV_MAP: Record<string, Severity | null> = { All: null, Critical: 'crit', Warning: 'warn', Info: 'info' };

export default function Alerts({ dash }: { dash: Dash }) {
  const s = dash.state;
  const filter = SEV_MAP[s.sevFilter];
  const open = s.alerts.filter((a) => !filter || a.sev === filter);
  const options = Object.keys(SEV_MAP).map((k): [string, string] => [k, k + ' · ' + (SEV_MAP[k] ? s.alerts.filter((a) => a.sev === SEV_MAP[k]).length : s.alerts.length)]);

  return (
    <div className="page">
      <Chips options={options} value={s.sevFilter} onChange={(sevFilter) => dash.set({ sevFilter })} />
      <section className="panel">
        <PanelHead title="Open"><div className="panel-meta">{open.length} open</div></PanelHead>
        {open.map((a) => (
          <div key={a.id} className="alert-row full">
            <span className="alert-bar" style={{ background: SEV[a.sev][0] }} />
            <span className="sev-label" style={{ color: SEV[a.sev][0] }}>{SEV[a.sev][1]}</span>
            <div className="alert-text"><span className="alert-title">{a.title}</span><span className="alert-meta">{a.meta}</span></div>
            <button className="btn-ghost" style={{ padding: '6px 12px', color: 'var(--text)' }} onClick={() => dash.ack(a.id)}>Acknowledge</button>
          </div>
        ))}
        {open.length === 0 && <div className="empty" style={{ padding: '24px 18px' }}>Nothing open in this filter.</div>}
      </section>
      <section className="panel">
        <PanelHead title="Acknowledged"><div className="panel-meta">This shift</div></PanelHead>
        {s.acked.map((a) => (
          <div key={a.id} className="alert-row acked">
            <span className="alert-bar" style={{ background: SEV[a.sev][0] }} />
            <span className="sev-label" style={{ color: SEV[a.sev][0] }}>{SEV[a.sev][1]}</span>
            <div className="alert-text"><span className="alert-title">{a.title}</span><span className="alert-meta">{a.meta}</span></div>
          </div>
        ))}
      </section>
    </div>
  );
}

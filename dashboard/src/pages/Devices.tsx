import { LINE_NAMES, isOff } from '../data';
import { LINE_OPTIONS } from '../selectors';
import type { Dash } from '../useDashboard';
import { Chips, StatusCell } from '../components/ui';

export default function Devices({ dash }: { dash: Dash }) {
  const s = dash.state;
  const q = s.query.trim().toLowerCase();
  const list = s.devices.filter((d) =>
    (s.line === 'All' || d.line === s.line) &&
    (s.status === 'All' || d.status === s.status.toLowerCase()) &&
    (!q || d.id.toLowerCase().includes(q) || d.model.toLowerCase().includes(q)),
  );

  return (
    <div className="page">
      <div className="filters">
        <input className="search" value={s.query} onChange={(e) => dash.set({ query: e.target.value })} placeholder="Search ID or model" />
        <Chips options={LINE_OPTIONS} value={s.line} onChange={(line) => dash.set({ line })} />
        <Chips options={['All', 'Online', 'Degraded', 'Offline']} value={s.status} onChange={(status) => dash.set({ status })} />
      </div>
      <section className="panel">
        <div className="table-scroll"><div style={{ minWidth: 900 }}>
          <div className="trow head dev-grid">
            <span>Device</span><span>Model</span><span>Line</span><span>Status</span><span>CPU</span><span>Temp</span><span>Latency</span><span>Uptime</span><span>FW</span><span>Address</span><span />
          </div>
          {list.map((d) => {
            const off = isOff(d);
            return (
              <div key={d.id} className={'trow click dev-grid' + (d.id === s.sel ? ' selected' : '')} onClick={() => dash.set({ sel: d.id })}>
                <span className="mono">{d.id}</span>
                <span className="muted">{d.model}</span>
                <span className="muted">{d.line + ' · ' + LINE_NAMES[d.line]}</span>
                <StatusCell status={d.status} />
                <span className="mono">{off ? '—' : Math.round(d.cpu) + '%'}</span>
                <span className="mono">{off ? '—' : d.temp.toFixed(1) + '°'}</span>
                <span className="mono">{off ? '—' : d.latency.toFixed(1) + ' ms'}</span>
                <span className="mono muted">{(d.status === 'rebooting' ? 0 : d.uptime) + ' d'}</span>
                <span className="mono muted">{d.fw}</span>
                <span className="mono muted">{d.ip}</span>
                <button className="btn-ghost btn-row" onClick={(e) => { e.stopPropagation(); dash.reboot(d.id); }}>
                  {d.status === 'rebooting' ? '…' : 'Reboot'}
                </button>
              </div>
            );
          })}
        </div></div>
        {list.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 15 }}>No devices match these filters</div>
            <div className="panel-sub">Try another line, status or search term.</div>
            <button className="btn-quiet" onClick={() => dash.set({ line: 'All', status: 'All', query: '' })}>Clear filters</button>
          </div>
        )}
        <div className="table-foot">Showing {list.length} of {s.devices.length} devices</div>
      </section>
    </div>
  );
}

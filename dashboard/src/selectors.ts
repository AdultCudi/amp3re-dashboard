import { CELL, HEAT, LINES, scale, type Device, type FloorMetric } from './data';
import type { DashState } from './useDashboard';

export const LINE_OPTIONS = ['All', ...LINES];

export function rolloutStages(rollCD: number) {
  const roll = (label: string, pct: number, queued = false) => ({
    label,
    status: queued ? 'Queued' : pct >= 100 ? 'Complete' : pct + '%',
    width: pct + '%',
    color: pct >= 100 ? 'var(--normal)' : 'var(--muted)',
  });
  return [roll('Canary · 6 devices', 100), roll('Lines A–B', 100), roll('Lines C–D', rollCD), roll('Lines E–F', 0, true)];
}

export const FLOOR_LEGENDS: Record<FloorMetric, { label: string; color: string }[]> = {
  status: [{ label: 'Normal', color: 'var(--normal)' }, { label: '! Degraded', color: 'var(--warn)' }, { label: '× Offline', color: 'var(--crit)' }, { label: '↻ Rebooting', color: 'var(--info)' }],
  temperature: [{ label: '35 °C', color: HEAT[0] }, { label: '50 °C', color: HEAT[1] }, { label: '65 °C', color: HEAT[3] }, { label: '80 °C', color: HEAT[4] }],
  cpu: [{ label: '0%', color: HEAT[0] }, { label: '35%', color: HEAT[1] }, { label: '70%', color: HEAT[3] }, { label: '100%', color: HEAT[4] }],
};

export function cellColor(d: Device, metric: FloorMetric): string {
  if (d.status === 'offline') return 'var(--crit)';
  if (d.status === 'rebooting') return 'var(--info)';
  if (metric === 'temperature') return scale(d.temp, 35, 80);
  if (metric === 'cpu') return scale(d.cpu, 0, 100);
  return CELL[d.status];
}

/** Headline numbers shared by the overview and the control room. */
export function fleetKpis(s: DashState) {
  const devs = s.devices;
  const online = devs.filter((d) => d.status === 'online' || d.status === 'degraded');
  const up = devs.filter((d) => d.status === 'online');
  const p95 = up.map((d) => d.latency).sort((a, b) => a - b)[Math.floor(up.length * 0.95)] ?? 0;
  const crit = s.alerts.filter((a) => a.sev === 'crit').length;
  return { online: online.length, total: devs.length, p95, overSla: p95 > s.sla, crit };
}

export const timeOf = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/** Live indicator; a lost connection overrides the stream state. */
export function liveStatus(s: DashState) {
  const lost = s.conn !== 'ok';
  return {
    lost,
    dot: lost ? 'var(--crit)' : s.live ? 'var(--ok)' : 'var(--dim)',
    label: lost ? 'Offline' : s.live ? 'Live · ' + s.interval / 1000 + 's' : 'Paused',
  };
}

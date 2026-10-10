// Placeholder fleet data and helpers. All plant, device and alert content is demo data.

export type LineId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type DeviceStatus = 'online' | 'degraded' | 'offline' | 'rebooting';
export type Severity = 'crit' | 'warn' | 'info';
export type FloorMetric = 'status' | 'temperature' | 'cpu';
export type TelMetric = 'latency' | 'throughput' | 'cpu' | 'temp';
export type Page = 'Overview' | 'Devices' | 'Lines' | 'Telemetry' | 'Alerts' | 'Deployments' | 'Settings';

export interface Device {
  id: string;
  line: LineId;
  station: number;
  model: string;
  status: DeviceStatus;
  cpu: number;
  temp: number;
  latency: number;
  uptime: number;
  fw: string;
  ip: string;
}

export interface Alert {
  id: number;
  sev: Severity;
  title: string;
  meta: string;
}

export const LINES: LineId[] = ['A', 'B', 'C', 'D', 'E', 'F'];
export const LINE_NAMES: Record<LineId, string> = { A: 'Stamping', B: 'Welding', C: 'Paint', D: 'Assembly', E: 'Inspection', F: 'Packaging' };
export const PROTO: Record<LineId, string> = { A: 'OPC UA', B: 'Modbus TCP', C: 'OPC UA', D: 'PROFINET', E: 'EtherNet/IP', F: 'MQTT' };
export const LINE_OEE: Record<LineId, number> = { A: 89.2, B: 84.6, C: 86.1, D: 82.3, E: 91.4, F: 90.2 };
export const LINE_UNITS: Record<LineId, number> = { A: 212, B: 184, C: 168, D: 176, E: 190, F: 198 };
export const SEV: Record<Severity, [string, string]> = { crit: ['#ef5b4c', 'Critical'], warn: ['#f0a43a', 'Warning'], info: ['#6fa8dc', 'Info'] };
export const HEAT = ['#1d3442', '#2f7fa6', '#d7c24a', '#f0a43a', '#ef5b4c'];
export const STATUS: Record<DeviceStatus, [string, string]> = {
  online: ['#3ecf8e', 'Online'],
  degraded: ['#f0a43a', 'Degraded'],
  offline: ['#5d636a', 'Offline'],
  rebooting: ['#6fa8dc', 'Rebooting'],
};
export const PAGES: Page[] = ['Overview', 'Devices', 'Lines', 'Telemetry', 'Alerts', 'Deployments', 'Settings'];
export const PAGE_TITLES: Record<Page, string> = {
  Overview: 'Edge fleet overview',
  Devices: 'Devices',
  Lines: 'Production lines',
  Telemetry: 'Telemetry',
  Alerts: 'Alerts',
  Deployments: 'Firmware deployments',
  Settings: 'Settings',
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Interpolate a value along the HEAT ramp. */
export function scale(v: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (v - min) / (max - min))) * (HEAT.length - 1);
  const i = Math.min(HEAT.length - 2, Math.floor(t));
  const f = t - i;
  const a = hex(HEAT[i]);
  const b = hex(HEAT[i + 1]);
  return 'rgb(' + a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(',') + ')';
}

/** Seeded PRNG (mulberry32) so the demo fleet is stable across reloads. */
export function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function healthy(r: () => number) {
  return { cpu: 20 + r() * 38, temp: 38 + r() * 18, latency: 4 + r() * 6 };
}

export function makeDevices(): Device[] {
  const r = rng(42);
  const out: Device[] = [];
  LINES.forEach((L, li) => {
    for (let s = 1; s <= 18; s++) {
      const model = s % 6 === 0 ? 'EG-200 Gateway' : s % 3 === 0 ? 'EV-12 Vision' : 'EN-40 Sensor node';
      const x = r();
      let status: DeviceStatus = x < 0.025 ? 'offline' : x < 0.07 ? 'degraded' : 'online';
      const id = L + '-' + String(s).padStart(2, '0');
      if (id === 'D-07' || id === 'C-12' || id === 'B-03') status = 'degraded';
      if (id === 'F-14') status = 'offline';
      let m = healthy(r);
      if (status === 'degraded') m = { cpu: 82 + r() * 12, temp: 68 + r() * 10, latency: 17 + r() * 20 };
      out.push({
        id,
        line: L,
        station: s,
        model,
        status,
        ...m,
        uptime: Math.round(4 + r() * 120),
        fw: li < 2 ? '4.2.1' : li < 4 ? (r() < 0.64 ? '4.2.1' : '4.1.7') : '4.1.7',
        ip: '10.4.' + (li + 10) + '.' + (s + 20),
      });
    }
  });
  return out;
}

export function series(n: number, base: number, amp: number, seed: number): number[] {
  const r = rng(seed);
  let v = base;
  return Array.from({ length: n }, () => {
    v = v + (r() - 0.5) * amp;
    v = clamp(v, base - amp * 2, base + amp * 2);
    return v;
  });
}

export const isOff = (d: Device) => d.status === 'offline' || d.status === 'rebooting';

/** Mean of a metric across devices that are reporting (not offline/rebooting). */
export function avgOf(ds: Device[], k: 'cpu' | 'temp' | 'latency'): number {
  const up = ds.filter((d) => !isOff(d));
  return up.reduce((a, d) => a + d[k], 0) / (up.length || 1);
}

export const INITIAL_ALERTS: Alert[] = [
  { id: 1, sev: 'crit', title: 'Spindle vibration over threshold', meta: 'D-07 · EV-12 · 2m ago' },
  { id: 2, sev: 'crit', title: 'Device unreachable', meta: 'F-14 · EN-40 · 26m ago' },
  { id: 3, sev: 'warn', title: 'Thermal throttling active', meta: 'C-12 · EG-200 · 9m ago' },
  { id: 4, sev: 'warn', title: 'Uplink packet loss 4.1%', meta: 'B-03 · EN-40 · 14m ago' },
  { id: 5, sev: 'info', title: 'Firmware 4.2.1 applied, batch 3', meta: 'Line C · 31m ago' },
];

export const INITIAL_ACKED: Alert[] = [
  { id: 91, sev: 'warn', title: 'Camera exposure drift', meta: 'E-09 · EV-12 · acked 12:58' },
  { id: 92, sev: 'info', title: 'Gateway failover test passed', meta: 'A-12 · EG-200 · acked 12:20' },
  { id: 93, sev: 'crit', title: 'PLC link timeout', meta: 'D-02 · EN-40 · acked 11:47' },
];

export const RELEASES = [
  { version: '4.1.7', date: 'Sep 12, 2026', notes: 'Thermal governor tuning for EG-200', status: 'Stable', color: '#3ecf8e' },
  { version: '4.1.6', date: 'Aug 27, 2026', notes: 'Modbus polling regression', status: 'Rolled back', color: '#ef5b4c' },
  { version: '4.1.5', date: 'Aug 20, 2026', notes: 'MQTT TLS 1.3, smaller OTA deltas', status: 'Superseded', color: '#8a9097' },
];

export const TOGGLES: [ToggleKey, string, string][] = [
  ['email', 'Email alerts', 'Critical and warning alerts to the plant on-call list'],
  ['sms', 'SMS for critical', 'Text the shift supervisor on critical alerts'],
  ['slack', 'Slack channel', 'Post all alerts to #mty04-edge'],
  ['escalate', 'Escalate after 10 min', 'Page maintenance lead if a critical alert stays open'],
  ['rollback', 'Auto-rollback', 'Revert firmware if latency exceeds the SLA after an update'],
  ['changeover', 'Update only during changeovers', 'Hold installs until a line is idle'],
];
export type ToggleKey = 'email' | 'sms' | 'slack' | 'escalate' | 'rollback' | 'changeover';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Alert, type Device, type FloorMetric, type Page, type TelMetric, type ToggleKey,
  INITIAL_ACKED, INITIAL_ALERTS, clamp, healthy, makeDevices, series,
} from './data';

export interface DashState {
  devices: Device[];
  sel: string;
  line: string; // 'All' or a LineId
  metric: FloorMetric;
  live: boolean;
  now: Date;
  oee: number;
  data: number;
  rollCD: number;
  lat: number[];
  thr: number[];
  cpuS: number[];
  tempS: number[];
  page: Page;
  query: string;
  status: string; // 'All' | 'Online' | 'Degraded' | 'Offline'
  telMetric: TelMetric;
  sevFilter: string; // 'All' | 'Critical' | 'Warning' | 'Info'
  rollPaused: boolean;
  interval: number;
  sla: number;
  plantName: string;
  saved: boolean;
  toggles: Record<ToggleKey, boolean>;
  alerts: Alert[];
  acked: Alert[];
}

export interface DashboardOptions {
  live?: boolean;
  floorMetric?: FloorMetric;
}

function initialState(opts: DashboardOptions): DashState {
  return {
    devices: makeDevices(),
    sel: 'D-07',
    line: 'All',
    metric: opts.floorMetric ?? 'status',
    live: opts.live ?? true,
    now: new Date(),
    oee: 87.4,
    data: 2.41,
    rollCD: 64,
    lat: series(60, 8.4, 1.6, 7),
    thr: series(60, 1080, 60, 9),
    cpuS: series(60, 39, 1.5, 11),
    tempS: series(60, 47, 0.6, 13),
    page: 'Overview',
    query: '',
    status: 'All',
    telMetric: 'latency',
    sevFilter: 'All',
    rollPaused: false,
    interval: 2000,
    sla: 15,
    plantName: 'Plant 04 · Monterrey',
    saved: false,
    toggles: { email: true, sms: true, slack: false, escalate: true, rollback: true, changeover: true },
    alerts: INITIAL_ALERTS,
    acked: INITIAL_ACKED,
  };
}

const jitter = (v: number, a: number) => v + (Math.random() - 0.5) * a;

function tick(s: DashState): DashState {
  const devices = s.devices.map((d) =>
    d.status === 'online' || d.status === 'degraded'
      ? { ...d, cpu: clamp(jitter(d.cpu, 6), 8, 99), temp: clamp(jitter(d.temp, 1.2), 32, 85), latency: clamp(jitter(d.latency, 1), 2.5, 45) }
      : d,
  );
  const up = devices.filter((d) => d.status === 'online');
  const av = (k: 'cpu' | 'temp') => up.reduce((a, d) => a + d[k], 0) / (up.length || 1);
  const lastL = s.lat[s.lat.length - 1];
  const lastT = s.thr[s.thr.length - 1];
  return {
    ...s,
    devices,
    now: new Date(),
    oee: clamp(jitter(s.oee, 0.3), 85, 90),
    data: s.data + 0.002,
    rollCD: s.rollPaused ? s.rollCD : Math.min(100, s.rollCD + (Math.random() < 0.4 ? 1 : 0)),
    cpuS: [...s.cpuS.slice(1), av('cpu')],
    tempS: [...s.tempS.slice(1), av('temp')],
    lat: [...s.lat.slice(1), clamp(jitter(lastL, 1.4), 5, 13)],
    thr: [...s.thr.slice(1), clamp(jitter(lastT, 40), 950, 1200)],
  };
}

export function useDashboard(opts: DashboardOptions) {
  const [state, setState] = useState<DashState>(() => initialState(opts));
  const set = useCallback((patch: Partial<DashState> | ((s: DashState) => Partial<DashState> | null)) => {
    setState((s) => {
      const p = typeof patch === 'function' ? patch(s) : patch;
      return p ? { ...s, ...p } : s;
    });
  }, []);

  // Sync externally controlled options (the prototype's Tweaks panel).
  useEffect(() => { if (opts.live != null) set({ live: opts.live }); }, [opts.live, set]);
  useEffect(() => { if (opts.floorMetric) set({ metric: opts.floorMetric }); }, [opts.floorMetric, set]);

  // Live stream: restarts whenever the interval or live flag changes.
  useEffect(() => {
    if (!state.live) return;
    const t = setInterval(() => setState(tick), state.interval);
    return () => clearInterval(t);
  }, [state.live, state.interval]);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const setDev = useCallback((id: string, patch: Partial<Device>) => {
    setState((s) => ({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  }, []);

  const reboot = useCallback((id: string) => {
    const d = state.devices.find((x) => x.id === id);
    if (!d || d.status === 'rebooting') return;
    setDev(id, { status: 'rebooting' });
    timers.current.push(window.setTimeout(() => setDev(id, { status: 'online', uptime: 0, ...healthy(Math.random) }), 4000));
  }, [state.devices, setDev]);

  const ack = useCallback((id: number) => {
    set((s) => {
      const a = s.alerts.find((x) => x.id === id);
      if (!a) return null;
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return {
        alerts: s.alerts.filter((x) => x.id !== id),
        acked: [{ ...a, meta: a.meta.replace(/ · [^·]*ago$/, '') + ' · acked ' + t }, ...s.acked],
      };
    });
  }, [set]);

  const go = useCallback((page: Page, extra?: Partial<DashState>) => {
    set({ page, ...extra });
    window.scrollTo(0, 0);
  }, [set]);

  return { state, set, reboot, ack, go };
}

export type Dash = ReturnType<typeof useDashboard>;

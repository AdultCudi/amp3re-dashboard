import { LINES } from './data';

export const LINE_OPTIONS = ['All', ...LINES];

export function rolloutStages(rollCD: number) {
  const roll = (label: string, pct: number, queued = false) => ({
    label,
    status: queued ? 'Queued' : pct >= 100 ? 'Complete' : pct + '%',
    width: pct + '%',
    color: pct >= 100 ? '#3ecf8e' : '#d7f54a',
  });
  return [roll('Canary · 6 devices', 100), roll('Lines A–B', 100), roll('Lines C–D', rollCD), roll('Lines E–F', 0, true)];
}

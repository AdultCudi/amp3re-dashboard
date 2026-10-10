import type { ReactNode } from 'react';
import { STATUS, type DeviceStatus } from '../data';

type Opt<T> = T | [T, string];

/** Bordered filter chips (line, status, severity). */
export function Chips<T extends string | number>({ options, value, onChange }: { options: Opt<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const [v, l]: [T, string] = Array.isArray(o) ? o : [o, String(o)];
        return (
          <button key={String(v)} className={'chip' + (v === value ? ' active' : '')} onClick={() => onChange(v)}>{l}</button>
        );
      })}
    </div>
  );
}

/** Segmented control. */
export function Tabs<T extends string | number>({ options, value, onChange, className = '' }: { options: [T, string][]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={('tabs ' + className).trim()}>
      {options.map(([v, l]) => (
        <button key={String(v)} className={'tab' + (v === value ? ' active' : '')} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function PanelHead({ title, sub, children, titleClass = 'panel-title' }: { title: ReactNode; sub?: ReactNode; children?: ReactNode; titleClass?: string }) {
  return (
    <div className="panel-head">
      {sub != null ? (
        <div className="stack-2"><div className={titleClass}>{title}</div><div className="panel-sub">{sub}</div></div>
      ) : (
        <div className={titleClass}>{title}</div>
      )}
      {children}
    </div>
  );
}

export function StatusCell({ status }: { status: DeviceStatus }) {
  const [color, label] = STATUS[status];
  return <span className="status-cell" style={{ color }}><span className="dot-sm" style={{ background: color }} />{label}</span>;
}

export function Bar({ label, status, width, color, mono }: { label: ReactNode; status: ReactNode; width: string; color: string; mono?: boolean }) {
  return (
    <div className="bar-item">
      <div className="bar-head"><span className={mono ? 'mono' : undefined}>{label}</span><span className="mono muted">{status}</span></div>
      <div className="track"><div style={{ width, background: color }} /></div>
    </div>
  );
}

export const AXIS_X = (
  <div className="axis-x"><span>−60 min</span><span>−45</span><span>−30</span><span>−15</span><span>now</span></div>
);

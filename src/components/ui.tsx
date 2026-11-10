import React from 'react';
import { MachineStatus, Workstation } from '../types';

export const STATUS: Record<MachineStatus | 'job', { label: string; color: string; text: string }> = {
  available: { label: 'Free', color: 'var(--color-safe)', text: '#fff' },
  in_use: { label: 'In use', color: 'var(--color-signal)', text: '#fff' },
  job: { label: 'Job running', color: 'var(--color-hazard)', text: 'var(--color-ink)' },
  maintenance: { label: 'Maintenance', color: 'var(--color-ink)', text: 'var(--color-hazard)' },
  offline: { label: 'Offline', color: 'var(--color-idle)', text: '#fff' },
};

export const stateOf = (ws: Workstation): keyof typeof STATUS =>
  ws.activeWorkload ? 'job' : ws.status;

export const StatusChip: React.FC<{ ws: Workstation; size?: 'sm' | 'md' }> = ({ ws, size = 'sm' }) => {
  const s = STATUS[stateOf(ws)];
  return (
    <span
      className={`sign inline-flex items-center gap-1.5 whitespace-nowrap ${size === 'sm' ? 'text-[12px] px-1.5 py-[3px]' : 'text-[15px] px-2.5 py-1'}`}
      style={{ background: s.color, color: s.text }}
    >
      {stateOf(ws) === 'job' && <span className="w-1.5 h-1.5 bg-current blink-slow" />}
      {s.label}
    </span>
  );
};

/** Segmented meter — 20 cells, like a fuel/load gauge on an equipment panel. */
export const Meter: React.FC<{ value: number; label?: string; hot?: number; color?: string; track?: string }> = ({
  value, label, hot = 85, color = 'var(--color-ink)', track = 'var(--color-slab)',
}) => {
  const cells = 20;
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * cells);
  return (
    <div className="flex items-center gap-2">
      {label && <span className="label w-9 shrink-0 !text-[12px]">{label}</span>}
      <div className="flex gap-[2px] flex-1" aria-hidden>
        {Array.from({ length: cells }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 flex-1"
            style={{
              background: i < lit ? (value >= hot && i >= cells * (hot / 100) ? 'var(--color-stop)' : color) : track,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[12px] w-10 text-right">{value}%</span>
    </div>
  );
};

export const PageHead: React.FC<{ code: string; title: string; note?: React.ReactNode; actions?: React.ReactNode }> = ({
  code, title, note, actions,
}) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 border-b-[3px] border-ink">
    <div className="flex items-start gap-4">
      <span className="sign bg-ink text-hazard text-[34px] w-14 h-14 grid place-items-center shrink-0">{code}</span>
      <div>
        <h1 className="sign text-[44px] md:text-[56px]">{title}</h1>
        {note && <p className="text-graphite mt-1.5 max-w-[62ch]">{note}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>
);

export const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

/** "Grace Hopper Interactive Graphics Studio" → "Grace Hopper"; "Turing High-Performance…" → "Turing". */
export const shortLab = (name: string) => {
  const w = name.split(' ');
  return /^[A-Z][a-z]+$/.test(w[1] || '') ? `${w[0]} ${w[1]}` : w[0];
};

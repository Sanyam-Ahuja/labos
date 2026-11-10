import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const SERIES = [
  { key: 'cpu', label: 'CPU', color: '#141414' },
  { key: 'ram', label: 'RAM', color: '#0057b8' },
  { key: 'gpu', label: 'GPU', color: '#1d7a3c' },
] as const;

export const chartAxis = { stroke: '#4a4945', tick: { fontSize: 12, fill: '#4a4945', fontFamily: 'JetBrains Mono' } };
export const chartTooltip = {
  contentStyle: { background: '#141414', border: 'none', borderRadius: 0, color: '#e3e1dc', fontFamily: 'JetBrains Mono', fontSize: 12 },
  labelStyle: { color: '#ffc400' },
};

export const ClusterTelemetryChart: React.FC = () => {
  const { workstations } = useLabStore();
  const ref = workstations[0];
  const data = ref.history.map((snap, idx) => {
    const live = workstations.filter((w) => w.status !== 'offline');
    const pts = live.map((w) => w.history[idx] || w.history[w.history.length - 1]).filter(Boolean);
    const gpuPts = live.filter((w) => w.specs.gpu).map((w) => w.history[idx] || w.history[w.history.length - 1]).filter(Boolean);
    const mean = (a: number[]) => Math.round(a.reduce((x, y) => x + y, 0) / (a.length || 1));
    return { time: snap.time, cpu: mean(pts.map((p) => p.cpu)), ram: mean(pts.map((p) => p.ram)), gpu: mean(gpuPts.map((p) => p.gpu)) };
  });

  return (
    <section className="plate p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <h2 className="sign text-[28px]">Load across all labs</h2>
        <div className="flex gap-4">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 label">
              <span className="w-5 h-[3px]" style={{ background: s.color }} />{s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#d4d1ca" vertical={false} />
            <XAxis dataKey="time" {...chartAxis} />
            <YAxis domain={[0, 100]} unit="%" {...chartAxis} />
            <Tooltip {...chartTooltip} />
            {SERIES.map((s) => (
              <Line key={s.key} type="linear" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={s.key === 'cpu' ? 2.5 : 2} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

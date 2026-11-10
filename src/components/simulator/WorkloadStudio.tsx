import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { WORKLOAD_PROFILES } from '../../data/seedData';
import { Workstation } from '../../types';
import { Meter, PageHead, StatusChip } from '../ui';
import { chartAxis, chartTooltip } from '../dashboard/ClusterTelemetryChart';
import { Play, Square } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Readout: React.FC<{ ws: Workstation; title: string; dark?: boolean }> = ({ ws, title, dark }) => (
  <div className={dark ? 'bg-ink text-concrete p-5' : 'plate p-5'}>
    <div className="flex justify-between items-start gap-2 mb-4">
      <div>
        <div className={`label ${dark ? '!text-idle' : ''}`}>{title}</div>
        <div className="sign text-[30px]">{ws.id}</div>
        <div className={`text-[13px] ${dark ? 'text-idle' : 'text-graphite'}`}>{ws.activeWorkload ? ws.activeWorkload.name : 'No workload'}</div>
      </div>
      <StatusChip ws={ws} />
    </div>
    <div className={`space-y-2 ${dark ? '[&_.label]:!text-idle' : ''}`}>
      <Meter label="CPU" value={ws.metrics.cpuUtil} color={dark ? '#e3e1dc' : undefined} track={dark ? '#2f2f2c' : undefined} />
      <Meter label="RAM" value={ws.metrics.ramUtil} color={dark ? '#e3e1dc' : '#0057b8'} track={dark ? '#2f2f2c' : undefined} />
      <Meter label="GPU" value={ws.metrics.gpuUtil} color={dark ? '#e3e1dc' : '#1d7a3c'} track={dark ? '#2f2f2c' : undefined} />
    </div>
    <div className="flex gap-6 mt-4 font-mono text-[13px]"><span>{ws.metrics.tempC} °C</span><span>{ws.metrics.powerWatts} W</span></div>
    <div className="h-40 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ws.history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid stroke={dark ? '#2b2b29' : '#d4d1ca'} vertical={false} />
          <XAxis dataKey="time" {...chartAxis} stroke={dark ? '#77756f' : chartAxis.stroke} tick={{ ...chartAxis.tick, fill: dark ? '#9a9891' : '#4a4945' }} />
          <YAxis domain={[0, 100]} {...chartAxis} stroke={dark ? '#77756f' : chartAxis.stroke} tick={{ ...chartAxis.tick, fill: dark ? '#9a9891' : '#4a4945' }} />
          <Tooltip {...chartTooltip} />
          <Line dataKey="cpu" name="CPU" stroke={dark ? '#ffc400' : '#141414'} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="gpu" name="GPU" stroke={dark ? '#6fd08f' : '#1d7a3c'} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const WorkloadStudio: React.FC = () => {
  const { workstations, startWorkload, stopWorkload } = useLabStore();
  const [profileId, setProfileId] = useState(WORKLOAD_PROFILES[0].id);
  const online = workstations.filter((w) => w.status !== 'offline');
  const [stationId, setStationId] = useState(online[0]?.id || '');
  const target = workstations.find((w) => w.id === stationId) || online[0];
  const baseline = workstations.find((w) => w.status === 'available' && !w.activeWorkload && w.id !== target?.id) || workstations[0];
  const running = workstations.filter((w) => w.activeWorkload).length;

  return (
    <div>
      <PageHead code="E" title="Workload bench" note="Load a simulated job onto a machine and watch it climb against an idle neighbour. Nothing runs on real hardware." actions={<span className="label">{running} jobs running</span>} />

      <ol className="grid md:grid-cols-2 xl:grid-cols-4 border-[1.5px] border-ink mb-6">
        {WORKLOAD_PROFILES.map((p) => {
          const on = p.id === profileId;
          return (
            <li key={p.id} className="border-b md:border-r border-ink last:border-0">
              <button onClick={() => setProfileId(p.id)} aria-pressed={on} className={`w-full h-full text-left p-4 ${on ? 'bg-hazard' : 'bg-panel hover:bg-white'}`}>
                <div className="label !text-ink">{p.type.replace('_', ' ')}</div>
                <div className="sign text-[22px] mt-1">{p.name}</div>
                <p className="text-[13px] text-graphite mt-2">{p.description}</p>
                <div className="font-mono text-[12px] mt-3 flex gap-3"><span>CPU {p.targetCpu}</span><span>GPU {p.targetGpu}</span><span>RAM {p.targetRam}</span></div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <select className="field sm:!w-auto flex-1" value={target?.id} onChange={(e) => setStationId(e.target.value)} aria-label="Target machine">
          {online.map((w) => <option key={w.id} value={w.id}>{w.id} · {w.labName.split(' ')[0]} · {w.specs.gpu ? w.specs.gpu.model : 'no GPU'}</option>)}
        </select>
        {target?.activeWorkload ? (
          <button className="btn btn-danger justify-center" onClick={() => stopWorkload(target.id)}><Square size={15} /> Stop job on {target.id}</button>
        ) : (
          <button className="btn btn-primary justify-center" onClick={() => target && startWorkload(target.id, profileId)}><Play size={15} /> Start on {target?.id}</button>
        )}
      </div>

      {target && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Readout ws={target} title="Under load" dark />
          <Readout ws={baseline} title="Idle reference" />
        </div>
      )}
    </div>
  );
};

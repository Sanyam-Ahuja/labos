import React, { useEffect, useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { WORKLOAD_PROFILES } from '../../data/seedData';
import { MachineStatus } from '../../types';
import { Meter, StatusChip } from '../ui';
import { SERIES, chartAxis, chartTooltip } from '../dashboard/ClusterTelemetryChart';
import { IncidentForm } from '../incidents/IncidentManager';
import { Play, Square, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/** Machine record — slides in from the right like an asset card pulled from the rack. */
export const MachineModal: React.FC = () => {
  const { workstations, selectedMachineId, setSelectedMachineId, startWorkload, stopWorkload, setMachineStatus } = useLabStore();
  const [profileId, setProfileId] = useState(WORKLOAD_PROFILES[0].id);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    setReporting(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedMachineId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedMachineId, setSelectedMachineId]);

  const ws = workstations.find((w) => w.id === selectedMachineId);
  if (!ws) return null;

  const spec: [string, string][] = [
    ['Processor', `${ws.specs.cpu.model} · ${ws.specs.cpu.cores} cores @ ${ws.specs.cpu.baseFreqGhz} GHz`],
    ['Memory', `${ws.specs.ramGb} GB`],
    ['Graphics', ws.specs.gpu ? `${ws.specs.gpu.model} · ${ws.specs.gpu.vramGb} GB` : 'Integrated only'],
    ['Storage', `${ws.specs.storageGb} GB NVMe · ${ws.metrics.storageUtil}% used`],
    ['System', ws.specs.os],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Machine ${ws.id}`}>
      <button className="absolute inset-0 bg-ink/50" onClick={() => setSelectedMachineId(null)} aria-label="Close" />
      <aside className="relative w-full max-w-[560px] h-full overflow-y-auto bg-concrete border-l-[6px] border-ink">
        <div className="bg-ink text-concrete p-5 sticky top-0 z-10">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="font-mono text-[12px] text-hazard">{ws.hostname}</div>
              <h2 className="sign text-[46px]">{ws.id}</h2>
              <div className="text-[14px] text-idle">{ws.labName} · Row {ws.row}, desk {ws.col}</div>
            </div>
            <button onClick={() => setSelectedMachineId(null)} className="p-2 border border-graphite hover:text-hazard" aria-label="Close"><X size={18} /></button>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <StatusChip ws={ws} size="md" />
            <select className="bg-ink border border-graphite text-concrete text-[14px] px-2 py-1" value={ws.status} onChange={(e) => setMachineStatus(ws.id, e.target.value as MachineStatus)} aria-label="Set state">
              <option value="available">Set free</option>
              <option value="in_use">Set in use</option>
              <option value="maintenance">Set maintenance</option>
              <option value="offline">Set offline</option>
            </select>
          </div>
        </div>

        <div className="p-5 space-y-7">
          <section className="space-y-2">
            <Meter label="CPU" value={ws.metrics.cpuUtil} />
            <Meter label="RAM" value={ws.metrics.ramUtil} color="#0057b8" />
            <Meter label="GPU" value={ws.metrics.gpuUtil} color="#1d7a3c" />
            <div className="flex gap-8 pt-2">
              <div><div className="sign text-[34px]">{ws.metrics.tempC}°C</div><div className="label !text-[11px]">die temp</div></div>
              <div><div className="sign text-[34px]">{ws.metrics.powerWatts} W</div><div className="label !text-[11px]">draw</div></div>
            </div>
          </section>

          <section>
            <h3 className="sign text-[22px] border-b-[3px] border-ink pb-1 mb-3">History</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ws.history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="#d4d1ca" vertical={false} />
                  <XAxis dataKey="time" {...chartAxis} />
                  <YAxis domain={[0, 100]} {...chartAxis} />
                  <Tooltip {...chartTooltip} />
                  {SERIES.map((s) => <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h3 className="sign text-[22px] border-b-[3px] border-ink pb-1 mb-1">Hardware</h3>
            <dl>
              {spec.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-2 border-b border-ink/20 text-[14px]">
                  <dt className="label">{k}</dt><dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ws.software.map((s) => <span key={s} className="text-[13px] px-2 py-0.5 border border-ink bg-panel">{s}</span>)}
            </div>
          </section>

          <section>
            <h3 className="sign text-[22px] border-b-[3px] border-ink pb-1 mb-3">Workload</h3>
            {ws.activeWorkload ? (
              <div className="bg-hazard p-4 border-[1.5px] border-ink">
                <div className="font-semibold">{ws.activeWorkload.name}</div>
                <div className="text-[13px]">started {ws.activeWorkload.startedAt}</div>
                <button className="btn btn-danger mt-3" onClick={() => stopWorkload(ws.id)}><Square size={14} /> Stop job</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <select className="field" value={profileId} onChange={(e) => setProfileId(e.target.value)} aria-label="Workload">
                  {WORKLOAD_PROFILES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button className="btn btn-primary justify-center shrink-0" disabled={ws.status === 'offline' || ws.status === 'maintenance'} onClick={() => startWorkload(ws.id, profileId)}><Play size={14} /> Start</button>
              </div>
            )}
          </section>

          <section className="pb-6">
            <h3 className="sign text-[22px] border-b-[3px] border-ink pb-1 mb-3">Something wrong?</h3>
            {reporting ? <IncidentForm fixedWsId={ws.id} onDone={() => setReporting(false)} /> : (
              <button className="btn" onClick={() => setReporting(true)}>Tag this machine as faulty</button>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};

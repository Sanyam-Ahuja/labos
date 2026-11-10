import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { ClusterTelemetryChart } from './ClusterTelemetryChart';
import { Meter, STATUS, StatusChip, avg, shortLab, stateOf } from '../ui';
import { ArrowRight, Zap } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { laboratories, workstations, setActiveTab, setSelectedLabId, setSelectedMachineId } = useLabStore();

  const live = workstations.filter((w) => w.status !== 'offline');
  const gpus = live.filter((w) => w.specs.gpu);
  const free = workstations.filter((w) => w.status === 'available').length;
  const jobs = workstations.filter((w) => w.activeWorkload);
  const hottest = [...live].sort((a, b) => b.metrics.tempC - a.metrics.tempC).slice(0, 6);
  const powerKw = (workstations.reduce((a, w) => a + w.metrics.powerWatts, 0) / 1000).toFixed(1);
  const counts = (Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => ({
    k, n: workstations.filter((w) => stateOf(w) === k).length,
  }));

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Seat board: every machine on campus, one tile each */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h1 className="sign text-[56px] md:text-[76px]">
                <span className="bg-hazard px-2">{free}</span> seats free
              </h1>
              <p className="text-graphite mt-2">of {workstations.length} workstations across {laboratories.length} labs. Tap a tile to open the machine.</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {counts.map(({ k, n }) => (
                <span key={k} className="flex items-center gap-1.5 text-[14px]">
                  <span className="w-3.5 h-3.5 border border-ink" style={{ background: STATUS[k].color }} />
                  {STATUS[k].label} <b className="font-mono text-[13px]">{n}</b>
                </span>
              ))}
            </div>
          </div>

          <div className="border-t-[3px] border-ink">
            {laboratories.map((lab) => {
              const ws = workstations.filter((w) => w.labId === lab.id).sort((a, b) => a.row - b.row || a.col - b.col);
              const labFree = ws.filter((w) => w.status === 'available').length;
              return (
                <div key={lab.id} className="grid sm:grid-cols-[200px_1fr] gap-3 py-4 border-b border-ink/30 items-center">
                  <button
                    className="text-left group"
                    onClick={() => { setSelectedLabId(lab.id); setActiveTab('laboratories'); }}
                  >
                    <span className="font-mono text-[12px] text-graphite">{lab.code} · {lab.room}</span>
                    <span className="sign block text-[22px] group-hover:underline decoration-hazard decoration-4 underline-offset-2">
                      {shortLab(lab.name)}
                    </span>
                    <span className="text-[13px] text-graphite">{labFree} free{lab.gpuLab ? ' · GPU room' : ''}</span>
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {ws.map((w) => {
                      const s = STATUS[stateOf(w)];
                      return (
                        <button
                          key={w.id}
                          onClick={() => setSelectedMachineId(w.id)}
                          title={`${w.id} — ${s.label}`}
                          className="w-11 h-11 border-[1.5px] border-ink font-mono text-[10px] leading-none grid place-items-center hover:-translate-y-0.5 transition-transform"
                          style={{ background: s.color, color: s.text }}
                        >
                          {w.id.split('-').pop()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Readings column */}
        <aside className="bg-ink text-concrete p-5 self-start">
          <h2 className="sign text-[26px] text-hazard mb-4">Live readings</h2>
          <dl className="space-y-4 [&_.label]:!text-idle">
            <div><Meter label="CPU" value={avg(live.map((w) => w.metrics.cpuUtil))} color="#e3e1dc" track="#2f2f2c" /></div>
            <div><Meter label="RAM" value={avg(live.map((w) => w.metrics.ramUtil))} color="#e3e1dc" track="#2f2f2c" /></div>
            <div><Meter label="GPU" value={avg(gpus.map((w) => w.metrics.gpuUtil))} color="#e3e1dc" track="#2f2f2c" /></div>
          </dl>
          <div className="grid grid-cols-2 gap-px bg-graphite mt-6 border border-graphite">
            {[
              ['Power draw', `${powerKw} kW`],
              ['Mean temp', `${avg(live.map((w) => w.metrics.tempC))} °C`],
              ['GPU machines', `${gpus.length}`],
              ['Jobs running', `${jobs.length}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-3">
                <div className="text-[12px] text-idle">{k}</div>
                <div className="sign text-[30px] mt-1">{v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('simulator')} className="btn btn-primary w-full justify-center mt-5">
            <Zap size={16} /> Run a workload
          </button>
        </aside>
      </div>

      <ClusterTelemetryChart />

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-baseline justify-between border-b-[3px] border-ink pb-2 mb-1">
            <h2 className="sign text-[26px]">Jobs on the floor</h2>
            <button onClick={() => setActiveTab('simulator')} className="label flex items-center gap-1 hover:text-ink">Workloads <ArrowRight size={14} /></button>
          </div>
          {jobs.length === 0 ? (
            <p className="py-8 text-graphite">Nothing running. Start a simulated workload from section E to see the floor heat up.</p>
          ) : (
            <ul>
              {jobs.map((w) => (
                <li key={w.id}>
                  <button onClick={() => setSelectedMachineId(w.id)} className="w-full flex items-center justify-between gap-3 py-3 border-b border-ink/20 text-left hover:bg-panel px-1">
                    <span>
                      <span className="font-mono text-[13px] font-semibold">{w.id}</span>
                      <span className="block text-[14px] text-graphite">{w.activeWorkload?.name}</span>
                    </span>
                    <span className="font-mono text-[13px] text-right">GPU {w.metrics.gpuUtil}%<br /><span className="text-graphite">{w.metrics.tempC} °C</span></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <div className="flex items-baseline justify-between border-b-[3px] border-ink pb-2 mb-1">
            <h2 className="sign text-[26px]">Running hottest</h2>
            <button onClick={() => setActiveTab('inventory')} className="label flex items-center gap-1 hover:text-ink">Fleet <ArrowRight size={14} /></button>
          </div>
          <ul>
            {hottest.map((w) => (
              <li key={w.id}>
                <button onClick={() => setSelectedMachineId(w.id)} className="w-full grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3 border-b border-ink/20 text-left hover:bg-panel px-1">
                  <span>
                    <span className="font-mono text-[13px] font-semibold">{w.id}</span>
                    <span className="block text-[14px] text-graphite truncate">{w.specs.gpu ? w.specs.gpu.model : w.specs.cpu.model.split('/')[0]}</span>
                  </span>
                  <StatusChip ws={w} />
                  <span className={`sign text-[24px] w-16 text-right ${w.metrics.tempC >= 80 ? 'text-stop' : ''}`}>{w.metrics.tempC}°</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

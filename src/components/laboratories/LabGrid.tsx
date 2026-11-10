import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { Workstation } from '../../types';
import { PageHead, STATUS, shortLab, stateOf } from '../ui';
import { Zap } from 'lucide-react';

const Desk: React.FC<{ ws: Workstation; onOpen: () => void }> = ({ ws, onOpen }) => {
  const s = STATUS[stateOf(ws)];
  const off = ws.status === 'offline';
  return (
    <button
      onClick={onOpen}
      className="group text-left bg-white border-[1.5px] border-ink hover:shadow-[0_6px_14px_-6px_rgba(20,20,20,.45)] hover:-translate-y-0.5 transition-all"
      style={{ opacity: off ? 0.55 : 1 }}
    >
      {/* monitor edge = status colour */}
      <div className="h-2" style={{ background: s.color }} />
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono text-[12px] font-semibold">{ws.id}</span>
          {ws.specs.gpu && <Zap size={13} className="text-safe" aria-label="GPU" />}
        </div>
        <div className="sign text-[15px] mt-1" style={{ color: s.color === 'var(--color-hazard)' ? 'var(--color-ink)' : s.color }}>{s.label}</div>
        {!off ? (
          <div className="mt-2 grid grid-cols-3 gap-1 font-mono text-[11px] text-graphite">
            <span>C{ws.metrics.cpuUtil}</span>
            <span>{ws.specs.gpu ? `G${ws.metrics.gpuUtil}` : '—'}</span>
            <span className={ws.metrics.tempC >= 80 ? 'text-stop font-semibold' : ''}>{ws.metrics.tempC}°</span>
          </div>
        ) : (
          <div className="mt-2 font-mono text-[11px] text-graphite">no signal</div>
        )}
      </div>
    </button>
  );
};

export const LabGrid: React.FC = () => {
  const { laboratories, workstations, selectedLabId, setSelectedLabId, setSelectedMachineId } = useLabStore();
  const lab = laboratories.find((l) => l.id === (selectedLabId || laboratories[0].id)) || laboratories[0];
  const ws = workstations.filter((w) => w.labId === lab.id);
  const rows = Array.from({ length: lab.rows }, (_, r) => ws.filter((w) => w.row === r + 1).sort((a, b) => a.col - b.col));

  return (
    <div>
      <PageHead code="B" title="Floor plans" note="Every desk drawn where it actually sits. The coloured edge on each monitor is its live state." />

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <nav aria-label="Laboratories" className="border-t-[3px] border-ink self-start">
          {laboratories.map((l) => {
            const inLab = workstations.filter((w) => w.labId === l.id);
            const on = l.id === lab.id;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedLabId(l.id)}
                className={`w-full text-left p-3 border-b border-ink/30 ${on ? 'bg-ink text-concrete' : 'hover:bg-panel'}`}
              >
                <span className={`font-mono text-[12px] ${on ? 'text-hazard' : 'text-graphite'}`}>{l.code}</span>
                <span className="sign block text-[21px]">{shortLab(l.name)}</span>
                <span className={`text-[13px] ${on ? 'text-idle' : 'text-graphite'}`}>
                  {l.building.split(' ').slice(-2).join(' ')} · {l.room} · {inLab.filter((w) => w.status === 'available').length}/{inLab.length} free
                </span>
              </button>
            );
          })}
        </nav>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <h2 className="sign text-[34px]">{lab.name}</h2>
              <p className="text-graphite">{lab.description}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-[13px]">
              {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5"><span className="w-4 h-2" style={{ background: STATUS[k].color }} />{STATUS[k].label}</span>
              ))}
            </div>
          </div>

          {/* the room: thick walls, door gap, front wall */}
          <div className="relative border-[6px] border-ink bg-[#ecebe7] p-4 sm:p-6"
            style={{ backgroundImage: 'linear-gradient(#d4d1ca 1px, transparent 1px), linear-gradient(90deg, #d4d1ca 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            <span className="absolute -left-[6px] bottom-10 w-[6px] h-16 bg-[#ecebe7]" aria-hidden />
            <span className="absolute -left-1 bottom-[52px] label !text-[11px] -rotate-90 origin-left">Door</span>
            <div className="bg-ink text-concrete text-center sign text-[14px] tracking-[0.3em] py-1.5 mb-6">Front · screen &amp; instructor bench</div>
            <div className="space-y-5">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[28px_1fr] gap-2 items-center">
                  <span className="sign text-[18px] text-graphite">R{i + 1}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {row.map((w) => <Desk key={w.id} ws={w} onOpen={() => setSelectedMachineId(w.id)} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

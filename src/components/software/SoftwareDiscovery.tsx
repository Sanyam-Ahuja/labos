import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { PageHead, StatusChip } from '../ui';
import { Search, Zap } from 'lucide-react';

export const SoftwareDiscovery: React.FC = () => {
  const { workstations, setSelectedMachineId } = useLabStore();
  const [tag, setTag] = useState('CUDA 12.4');
  const [search, setSearch] = useState('');

  const all = Array.from(new Set(workstations.flatMap((w) => w.software))).sort();
  const tags = all.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  const hits = workstations.filter((w) => w.software.includes(tag))
    .sort((a, b) => Number(b.status === 'available') - Number(a.status === 'available'));
  const freeHits = hits.filter((w) => w.status === 'available').length;

  return (
    <div>
      <PageHead code="D" title="Where is it installed?" note={`Pick a package to see which desks have it, free ones first. ${all.length} packages catalogued.`} />
      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        <div>
          <label className="relative block mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite" />
            <input className="field !pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter packages" />
          </label>
          <ul className="border-t-[3px] border-ink max-h-[560px] overflow-y-auto">
            {tags.length === 0 && <li className="py-6 text-graphite">No package called “{search}”.</li>}
            {tags.map((s) => {
              const n = workstations.filter((w) => w.software.includes(s)).length;
              const on = s === tag;
              return (
                <li key={s}>
                  <button onClick={() => setTag(s)} className={`w-full flex justify-between items-center px-2 py-2 border-b border-ink/20 text-left ${on ? 'bg-hazard font-semibold' : 'hover:bg-panel'}`}>
                    <span className="truncate">{s}</span>
                    <span className="font-mono text-[12px]">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <section>
          <div className="bg-ink text-concrete p-5 mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="label !text-idle">Package</div>
              <div className="sign text-[42px] text-hazard">{tag}</div>
            </div>
            <div className="flex gap-6">
              <div><div className="sign text-[34px]">{hits.length}</div><div className="text-[12px] text-idle">machines</div></div>
              <div><div className="sign text-[34px] text-[#6fd08f]">{freeHits}</div><div className="text-[12px] text-idle">free now</div></div>
              <div><div className="sign text-[34px]">{hits.filter((w) => w.specs.gpu).length}</div><div className="text-[12px] text-idle">with GPU</div></div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {hits.map((w) => (
              <button key={w.id} onClick={() => setSelectedMachineId(w.id)} className="text-left bg-panel border-[1.5px] border-ink p-3 hover:bg-white">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold">{w.id}</span>
                  <StatusChip ws={w} />
                </div>
                <div className="text-[13px] text-graphite mt-1">{w.labName.split(' ')[0]} lab · Row {w.row}</div>
                <div className="text-[13px] mt-2 flex items-center gap-1">
                  {w.specs.gpu ? <><Zap size={13} className="text-safe" />{w.specs.gpu.model}</> : `${w.specs.cpu.cores} cores · ${w.specs.ramGb} GB`}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

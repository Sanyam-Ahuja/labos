import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { IncidentReport } from '../../types';
import { PageHead } from '../ui';
import { Check, Plus, X } from 'lucide-react';

type Sev = IncidentReport['severity'];
const SEV: Record<Sev, { bg: string; fg: string }> = {
  critical: { bg: 'var(--color-stop)', fg: '#fff' },
  high: { bg: 'var(--color-hazard)', fg: 'var(--color-ink)' },
  medium: { bg: 'var(--color-panel)', fg: 'var(--color-ink)' },
  low: { bg: 'var(--color-slab)', fg: 'var(--color-graphite)' },
};

export const IncidentForm: React.FC<{ fixedWsId?: string; onDone: () => void }> = ({ fixedWsId, onDone }) => {
  const { workstations, reportIncident } = useLabStore();
  const [wsId, setWsId] = useState(fixedWsId || workstations[0]?.id || '');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState<Sev>('high');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ws = workstations.find((w) => w.id === wsId);
    reportIncident({ workstationId: wsId, labId: ws ? ws.labId : 'turing-ai', title, description: desc, severity, status: 'investigating' });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      {!fixedWsId && (
        <label className="block"><span className="label block mb-1">Machine</span>
          <select className="field" value={wsId} onChange={(e) => setWsId(e.target.value)}>
            {workstations.map((w) => <option key={w.id} value={w.id}>{w.id} · {w.labName.split(' ')[0]} ({w.status.replace('_', ' ')})</option>)}
          </select>
        </label>
      )}
      <label className="block"><span className="label block mb-1">What is wrong</span>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="GPU fan rattling, throttles under load" required />
      </label>
      <fieldset>
        <legend className="label mb-1">Severity</legend>
        <div className="grid grid-cols-4 border-[1.5px] border-ink">
          {(['low', 'medium', 'high', 'critical'] as Sev[]).map((s) => (
            <button type="button" key={s} onClick={() => setSeverity(s)} aria-pressed={severity === s}
              className="sign text-[15px] py-2 border-r border-ink last:border-0"
              style={severity === s ? { background: SEV[s].bg === 'var(--color-panel)' ? 'var(--color-ink)' : SEV[s].bg, color: SEV[s].bg === 'var(--color-panel)' ? '#fff' : SEV[s].fg } : { background: '#fff' }}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block"><span className="label block mb-1">Details</span>
        <textarea className="field" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Error codes, what you were running, when it started" />
      </label>
      <p className="text-[13px] text-graphite">Filing a fault puts the machine into maintenance and stops any job on it.</p>
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn-danger">File fault tag</button>
      </div>
    </form>
  );
};

export const IncidentManager: React.FC = () => {
  const { incidents, resolveIncident, setSelectedMachineId } = useLabStore();
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');
  const [adding, setAdding] = useState(false);
  const open = incidents.filter((i) => i.status !== 'resolved');
  const list = incidents.filter((i) => (filter === 'all' ? true : filter === 'open' ? i.status !== 'resolved' : i.status === 'resolved'));

  return (
    <div>
      <PageHead code="F" title="Fault tags" note="Hardware problems reported by students and staff. A tagged machine is held in maintenance until the tag is cleared."
        actions={<button className="btn btn-danger" onClick={() => setAdding(true)}><Plus size={16} /> Report a fault</button>} />

      {adding && (
        <div className="plate max-w-xl mb-8">
          <div className="flex justify-between items-center bg-stop text-white px-4 py-2">
            <span className="sign text-[20px]">New fault tag</span>
            <button onClick={() => setAdding(false)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="p-4"><IncidentForm onDone={() => setAdding(false)} /></div>
        </div>
      )}

      <div className="flex border-[1.5px] border-ink w-fit mb-6" role="tablist">
        {([['open', `Open · ${open.length}`], ['resolved', `Cleared · ${incidents.length - open.length}`], ['all', 'All']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={`sign text-[16px] px-4 py-2 border-r border-ink last:border-0 ${filter === k ? 'bg-ink text-hazard' : 'bg-panel'}`}>{l}</button>
        ))}
      </div>

      {list.length === 0 && <p className="py-16 text-center text-graphite text-[17px]">No {filter === 'open' ? 'open' : ''} faults. Every machine is cleared to run.</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((inc) => {
          const done = inc.status === 'resolved';
          return (
            <article key={inc.id} className={`relative bg-white border-[1.5px] border-ink flex flex-col ${done ? 'opacity-70' : ''}`}>
              {/* tag eyelet */}
              <span className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-[1.5px] border-ink bg-concrete" aria-hidden />
              <div className="pt-9 px-4 pb-3 text-center" style={{ background: done ? 'var(--color-safe)' : SEV[inc.severity].bg, color: done ? '#fff' : SEV[inc.severity].fg }}>
                <div className="sign text-[26px]">{done ? 'Cleared' : inc.severity === 'critical' ? 'Do not use' : `${inc.severity} fault`}</div>
                <div className="font-mono text-[12px] mt-0.5">{inc.id}</div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-[16px] leading-snug">{inc.title}</h3>
                {inc.description && <p className="text-[14px] text-graphite mt-1.5">{inc.description}</p>}
                <dl className="grid grid-cols-2 gap-2 mt-4 text-[13px]">
                  <div><dt className="label !text-[11px]">Machine</dt><dd><button className="font-mono underline decoration-hazard decoration-2" onClick={() => setSelectedMachineId(inc.workstationId)}>{inc.workstationId}</button></dd></div>
                  <div><dt className="label !text-[11px]">{done ? 'Cleared' : 'Reported'}</dt><dd>{done ? inc.resolvedAt : inc.reportedAt}</dd></div>
                  <div className="col-span-2"><dt className="label !text-[11px]">State</dt><dd className="capitalize">{inc.status}</dd></div>
                </dl>
                {!done && (
                  <button className="btn mt-4 justify-center" onClick={() => resolveIncident(inc.id)}><Check size={15} /> Clear tag</button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

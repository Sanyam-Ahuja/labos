import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { MachineStatus } from '../../types';
import { PageHead, StatusChip } from '../ui';
import { Search, Zap } from 'lucide-react';

export const WorkstationTable: React.FC = () => {
  const {
    workstations, laboratories, selectedLabId, setSelectedLabId, filterGpuOnly, setFilterGpuOnly,
    filterStatus, setFilterStatus, searchQuery, setSearchQuery, setSelectedMachineId,
  } = useLabStore();

  const q = searchQuery.trim().toLowerCase();
  const rows = workstations.filter((ws) => {
    if (selectedLabId && ws.labId !== selectedLabId) return false;
    if (filterGpuOnly && !ws.specs.gpu) return false;
    if (filterStatus !== 'all' && ws.status !== filterStatus) return false;
    if (!q) return true;
    return [ws.id, ws.hostname, ws.labName, ws.specs.cpu.model, ws.specs.gpu?.model ?? '', ws.specs.os, ...ws.software]
      .some((s) => s.toLowerCase().includes(q));
  });

  return (
    <div>
      <PageHead code="C" title="Machine fleet" note="Every registered workstation with its hardware and live load. Search covers hostnames, chips, operating systems and installed software." />

      <div className="flex flex-col lg:flex-row gap-2 mb-4">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite" />
          <input className="field !pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Try “RTX”, “Ubuntu”, “Blender”, “TUR-07”…" />
        </label>
        <select className="field lg:!w-60" value={selectedLabId || ''} onChange={(e) => setSelectedLabId(e.target.value || null)}>
          <option value="">All labs</option>
          {laboratories.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select className="field lg:!w-48" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | MachineStatus)}>
          <option value="all">Any state</option>
          <option value="available">Free</option>
          <option value="in_use">In use</option>
          <option value="maintenance">Maintenance</option>
          <option value="offline">Offline</option>
        </select>
        <button onClick={() => setFilterGpuOnly(!filterGpuOnly)} className={`btn justify-center ${filterGpuOnly ? '!bg-ink !text-hazard' : ''}`} aria-pressed={filterGpuOnly}>
          <Zap size={15} /> GPU only
        </button>
      </div>

      <p className="label mb-2">{rows.length} of {workstations.length} machines</p>

      <div className="overflow-x-auto border-[1.5px] border-ink bg-panel">
        <table className="w-full text-left text-[14px] min-w-[760px]">
          <thead>
            <tr className="bg-ink text-concrete">
              {['Machine', 'Lab', 'Hardware', 'State', 'CPU', 'GPU', 'Temp'].map((h) => (
                <th key={h} className="sign text-[15px] font-semibold px-3 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-graphite">No machine matches those filters. Clear the search or switch “Any state”.</td></tr>
            )}
            {rows.map((ws) => {
              const off = ws.status === 'offline';
              return (
                <tr key={ws.id} onClick={() => setSelectedMachineId(ws.id)} className="border-t border-ink/20 cursor-pointer hover:bg-hazard/25">
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[13px] font-semibold">{ws.id}</span>
                    <span className="block font-mono text-[11px] text-graphite">{ws.hostname}</span>
                  </td>
                  <td className="px-3 py-2.5">{ws.labName.split(' ')[0]}<span className="block text-[12px] text-graphite">R{ws.row} · D{ws.col}</span></td>
                  <td className="px-3 py-2.5">
                    {ws.specs.cpu.model.split('/')[0]}
                    <span className="block text-[12px] text-graphite">{ws.specs.ramGb} GB · {ws.specs.gpu ? ws.specs.gpu.model : 'integrated graphics'}</span>
                  </td>
                  <td className="px-3 py-2.5"><StatusChip ws={ws} /></td>
                  <td className={`px-3 py-2.5 font-mono ${ws.metrics.cpuUtil > 80 ? 'text-stop font-semibold' : ''}`}>{off ? '—' : `${ws.metrics.cpuUtil}%`}</td>
                  <td className="px-3 py-2.5 font-mono">{off || !ws.specs.gpu ? '—' : `${ws.metrics.gpuUtil}%`}</td>
                  <td className={`px-3 py-2.5 font-mono ${ws.metrics.tempC >= 80 ? 'text-stop font-semibold' : ''}`}>{off ? '—' : `${ws.metrics.tempC}°`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

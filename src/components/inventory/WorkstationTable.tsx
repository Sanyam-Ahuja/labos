import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { MachineStatus } from '../../types';
import { Search, Filter, Cpu, Zap, Thermometer, ExternalLink, ShieldAlert } from 'lucide-react';

export const WorkstationTable: React.FC = () => {
  const {
    workstations,
    laboratories,
    selectedLabId,
    setSelectedLabId,
    filterGpuOnly,
    setFilterGpuOnly,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    setSelectedMachineId,
  } = useLabStore();

  const filtered = workstations.filter((ws) => {
    if (selectedLabId && ws.labId !== selectedLabId) return false;
    if (filterGpuOnly && !ws.specs.gpu) return false;
    if (filterStatus !== 'all' && ws.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBasic =
        ws.id.toLowerCase().includes(q) ||
        ws.hostname.toLowerCase().includes(q) ||
        ws.labName.toLowerCase().includes(q) ||
        ws.specs.cpu.model.toLowerCase().includes(q) ||
        (ws.specs.gpu && ws.specs.gpu.model.toLowerCase().includes(q)) ||
        ws.specs.os.toLowerCase().includes(q);
      const matchSoftware = ws.software.some((s) => s.toLowerCase().includes(q));
      if (!matchBasic && !matchSoftware) return false;
    }
    return true;
  });

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, GPU, CPU, CUDA, Blender, PyTorch, OS..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lab filter */}
          <select
            value={selectedLabId || ''}
            onChange={(e) => setSelectedLabId(e.target.value || null)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Laboratories ({laboratories.length})</option>
            {laboratories.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | MachineStatus)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="in_use">In Use / Busy</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>

          {/* GPU Only Toggle */}
          <button
            onClick={() => setFilterGpuOnly(!filterGpuOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 border transition-all ${
              filterGpuOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPU Accelerated Only</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing <strong className="text-white font-mono">{filtered.length}</strong> of <span className="font-mono">{workstations.length}</span> registered workstations</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/50">
              <th className="py-3 px-3">Workstation</th>
              <th className="py-3 px-3">Laboratory</th>
              <th className="py-3 px-3">Hardware Specification</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Telemetry</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filtered.map((ws) => (
              <tr
                key={ws.id}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                onClick={() => setSelectedMachineId(ws.id)}
              >
                <td className="py-3 px-3 font-mono">
                  <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {ws.id}
                  </div>
                  <div className="text-[10px] text-slate-400">{ws.hostname}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-slate-300 font-medium">{ws.labName.split(' ')[0]} Lab</div>
                  <div className="text-[10px] text-slate-500">{ws.specs.os.split(' ')[0]}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-slate-200 truncate max-w-xs">{ws.specs.cpu.model.split('/')[0]}</div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>{ws.specs.ramGb} GB RAM</span>
                    {ws.specs.gpu ? (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center">
                          <Zap className="w-3 h-3 inline mr-0.5" />
                          {ws.specs.gpu.model}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">Integrated iGPU</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3">
                  {ws.activeWorkload ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      JOB ACTIVE
                    </span>
                  ) : ws.status === 'available' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      AVAILABLE
                    </span>
                  ) : ws.status === 'in_use' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      BUSY
                    </span>
                  ) : ws.status === 'maintenance' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      MAINTENANCE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-500 border border-slate-700">
                      OFFLINE
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-mono">
                  {ws.status !== 'offline' ? (
                    <div className="flex items-center space-x-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[10px]">CPU </span>
                        <span className={ws.metrics.cpuUtil > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {ws.metrics.cpuUtil}%
                        </span>
                      </div>
                      {ws.specs.gpu && (
                        <div>
                          <span className="text-slate-500 text-[10px]">GPU </span>
                          <span className={ws.metrics.gpuUtil > 80 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {ws.metrics.gpuUtil}%
                          </span>
                        </div>
                      )}
                      <div className="text-slate-400">
                        {ws.metrics.tempC}°C
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">0% (Idle)</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMachineId(ws.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Inspect Workstation"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { Server, Cpu, HardDrive, Zap, CheckCircle2, AlertOctagon, Flame } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { workstations } = useLabStore();

  const total = workstations.length;
  const available = workstations.filter((w) => w.status === 'available').length;
  const inUse = workstations.filter((w) => w.status === 'in_use').length;
  const maintenance = workstations.filter((w) => w.status === 'maintenance').length;
  const offline = workstations.filter((w) => w.status === 'offline').length;
  const activeWorkloads = workstations.filter((w) => w.activeWorkload !== null).length;

  const activeNodes = workstations.filter((w) => w.status !== 'offline');
  const avgCpu = Math.round(
    activeNodes.reduce((acc, w) => acc + w.metrics.cpuUtil, 0) / (activeNodes.length || 1)
  );
  const avgRam = Math.round(
    activeNodes.reduce((acc, w) => acc + w.metrics.ramUtil, 0) / (activeNodes.length || 1)
  );

  const gpuNodes = activeNodes.filter((w) => w.specs.gpu !== null);
  const avgGpu = Math.round(
    gpuNodes.reduce((acc, w) => acc + w.metrics.gpuUtil, 0) / (gpuNodes.length || 1)
  );

  const totalPowerKw = (
    workstations.reduce((acc, w) => acc + w.metrics.powerWatts, 0) / 1000
  ).toFixed(1);

  const avgTemp = Math.round(
    activeNodes.reduce((acc, w) => acc + w.metrics.tempC, 0) / (activeNodes.length || 1)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* Total Nodes */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium tracking-wide uppercase">Workstations</span>
          <Server className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{total}</span>
          <span className="text-xs text-emerald-400 font-medium">4 Labs</span>
        </div>
        <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
          <span className="text-emerald-400">{available} avail</span>
          <span>•</span>
          <span className="text-blue-400">{inUse} busy</span>
          <span>•</span>
          <span className="text-rose-400">{offline} off</span>
        </div>
      </div>

      {/* Cluster CPU Load */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium tracking-wide uppercase">Cluster CPU</span>
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{avgCpu}%</span>
          <span className="text-xs text-slate-400 font-mono">avg load</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              avgCpu > 80 ? 'bg-rose-500' : avgCpu > 60 ? 'bg-amber-400' : 'bg-cyan-500'
            }`}
            style={{ width: `${avgCpu}%` }}
          />
        </div>
      </div>

      {/* Cluster RAM Utilization */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium tracking-wide uppercase">Cluster Memory</span>
          <HardDrive className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{avgRam}%</span>
          <span className="text-xs text-slate-400 font-mono">RAM in use</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${avgRam}%` }}
          />
        </div>
      </div>

      {/* GPU Compute Load */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium tracking-wide uppercase">GPU Compute</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{avgGpu}%</span>
          <span className="text-xs text-emerald-400 font-mono">{gpuNodes.length} GPUs</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${avgGpu}%` }}
          />
        </div>
      </div>

      {/* Cluster Power Draw */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium tracking-wide uppercase">Total Power</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{totalPowerKw}</span>
          <span className="text-xs text-amber-400 font-mono">kW</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Avg Temp: {avgTemp}°C</span>
          <Flame className="w-3 h-3 text-amber-500" />
        </div>
      </div>

      {/* Workload Status */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium tracking-wide uppercase">Simulation</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{activeWorkloads}</span>
          <span className="text-xs text-emerald-400 font-mono">jobs run</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 font-mono">
          {maintenance > 0 ? (
            <span className="text-amber-400">{maintenance} under repair</span>
          ) : (
            <span className="text-emerald-400">All nodes nominal</span>
          )}
        </div>
      </div>
    </div>
  );
};

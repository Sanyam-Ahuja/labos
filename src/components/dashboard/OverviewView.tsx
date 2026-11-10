import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { StatCards } from './StatCards';
import { ClusterTelemetryChart } from './ClusterTelemetryChart';
import { Layers, Cpu, Zap, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { laboratories, workstations, setActiveTab, setSelectedLabId, setSelectedMachineId } = useLabStore();

  const busyNodes = workstations.filter((w) => w.status === 'in_use' || w.activeWorkload !== null).slice(0, 6);
  const runningWorkloads = workstations.filter((w) => w.activeWorkload !== null);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Explicit Simulation Label */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Deterministic Campus Simulation Active:</span>
          <span>52 registered nodes generating real-time CPU, RAM, GPU and thermal telemetry.</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">[ Client-Side Observability Engine ]</span>
      </div>

      {/* Primary Aggregate KPI Cards */}
      <StatCards />

      {/* Cluster Telemetry Over Time */}
      <ClusterTelemetryChart />

      {/* Facilities Overview Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Computing Laboratory Facilities</span>
          </h3>
          <button
            onClick={() => setActiveTab('laboratories')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View All Seat Grids</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {laboratories.map((lab) => {
            const labStations = workstations.filter((w) => w.labId === lab.id);
            const avail = labStations.filter((w) => w.status === 'available').length;
            const inUse = labStations.filter((w) => w.status === 'in_use').length;
            const offline = labStations.filter((w) => w.status === 'offline').length;
            const percentAvail = Math.round((avail / (labStations.length || 1)) * 100);

            return (
              <div
                key={lab.id}
                onClick={() => {
                  setSelectedLabId(lab.id);
                  setActiveTab('laboratories');
                }}
                className="p-4 rounded-xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group text-left shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                    {lab.code}
                  </span>
                  {lab.gpuLab && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                      <Zap className="w-3 h-3 mr-0.5" /> GPU Cluster
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-white text-xs group-hover:text-emerald-400 transition-colors">
                  {lab.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">{lab.building} • {lab.room}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Available:</span>
                    <span className="text-emerald-400 font-bold">{avail} / {labStations.length}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${percentAvail}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Workloads & Node Spotlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Workloads */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Active Simulated Benchmark Workloads</h4>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Workload Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {runningWorkloads.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
              No benchmarks currently assigned. Launch a simulated workload in Workload Studio.
            </div>
          ) : (
            <div className="space-y-2">
              {runningWorkloads.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setSelectedMachineId(ws.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white text-xs">{ws.id}</span>
                    <p className="text-amber-300 text-[11px] font-medium">{ws.activeWorkload?.name}</p>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <div className="text-emerald-400 font-bold">GPU {ws.metrics.gpuUtil}%</div>
                    <div className="text-slate-400">CPU {ws.metrics.cpuUtil}% • {ws.metrics.tempC}°C</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highest Loaded Workstations */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Highest Compute Load Workstations</h4>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>All Workstations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {busyNodes.map((ws) => (
              <div
                key={ws.id}
                onClick={() => setSelectedMachineId(ws.id)}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white text-xs">{ws.id}</span>
                  <p className="text-slate-400 text-[11px] truncate max-w-[200px]">
                    {ws.specs.gpu ? ws.specs.gpu.model : ws.specs.cpu.model.split('/')[0]}
                  </p>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div className="text-cyan-400 font-bold">CPU {ws.metrics.cpuUtil}%</div>
                  <div className="text-slate-400">RAM {ws.metrics.ramUtil}% • {ws.metrics.powerWatts}W</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

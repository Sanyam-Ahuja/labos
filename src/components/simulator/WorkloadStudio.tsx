import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { WORKLOAD_PROFILES } from '../../data/seedData';
import { WorkloadProfile, Workstation } from '../../types';
import { Zap, Play, Square, Cpu, HardDrive, Thermometer, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const WorkloadStudio: React.FC = () => {
  const { workstations, startWorkload, stopWorkload, setSelectedMachineId } = useLabStore();

  const [selectedProfileId, setSelectedProfileId] = useState<string>(WORKLOAD_PROFILES[0].id);
  const selectedProfile = WORKLOAD_PROFILES.find((p) => p.id === selectedProfileId) || WORKLOAD_PROFILES[0];

  const onlineStations = workstations.filter((w) => w.status !== 'offline');
  const [selectedStationId, setSelectedStationId] = useState<string>(onlineStations[0]?.id || '');

  const activeStation = workstations.find((w) => w.id === selectedStationId) || onlineStations[0];
  const baselineStation = workstations.find((w) => w.status === 'available' && w.id !== activeStation?.id) || workstations[0];

  const runningWorkloads = workstations.filter((w) => w.activeWorkload !== null);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 mb-1">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold text-white text-lg">Workload Telemetry Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Inject deterministic compute benchmarks into fictional campus workstations. Observe real-time changes in GPU utilization, memory saturation, thermal dissipation, and power draw without impacting physical hardware.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Active Benchmark Jobs: </span>
              <span className="text-amber-400 font-bold">{runningWorkloads.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Workload Profiles Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {WORKLOAD_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedProfileId;
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedProfileId(profile.id)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-800 border-amber-500/70 shadow-lg shadow-amber-950/20'
                  : 'bg-[#111827] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {profile.type.replace('_', ' ')}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <h4 className="font-semibold text-white text-xs mb-1.5">{profile.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {profile.description}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <span>CPU: ~{profile.targetCpu}%</span>
                <span>GPU: ~{profile.targetGpu}%</span>
                <span>RAM: ~{profile.targetRam}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Target Workstation Selection & Launch Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-300">Select Target Node:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {onlineStations.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.id} ({ws.labName.split(' ')[0]}) — {ws.specs.gpu ? ws.specs.gpu.model : 'Integrated'}
                </option>
              ))}
            </select>
          </div>

          <div>
            {activeStation?.activeWorkload ? (
              <button
                onClick={() => stopWorkload(activeStation.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Workload on {activeStation.id}</span>
              </button>
            ) : (
              <button
                onClick={() => startWorkload(activeStation.id, selectedProfileId)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Benchmark on {activeStation.id}</span>
              </button>
            )}
          </div>
        </div>

        {/* Side-by-side Telemetry Comparison: Active vs Baseline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Target Node */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Target Node</span>
                <h4 className="text-sm font-bold text-white font-mono">{activeStation.id}</h4>
              </div>
              {activeStation.activeWorkload ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  SIMULATION ACTIVE: {activeStation.activeWorkload.name}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  IDLE / STANDBY
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">CPU LOAD</span>
                <div className="text-lg font-mono font-bold text-cyan-400">{activeStation.metrics.cpuUtil}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">RAM LOAD</span>
                <div className="text-lg font-mono font-bold text-indigo-400">{activeStation.metrics.ramUtil}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">GPU LOAD</span>
                <div className="text-lg font-mono font-bold text-emerald-400">{activeStation.metrics.gpuUtil}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">TEMP / POWER</span>
                <div className="text-xs font-mono font-bold text-amber-400 mt-1">{activeStation.metrics.tempC}°C • {activeStation.metrics.powerWatts}W</div>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeStation.history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="gpu" stroke="#34d399" fill="#34d399" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Baseline Idle Node */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Baseline Idle Reference</span>
                <h4 className="text-sm font-bold text-white font-mono">{baselineStation.id}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                UNLOADED STATE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">CPU LOAD</span>
                <div className="text-lg font-mono font-bold text-slate-300">{baselineStation.metrics.cpuUtil}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">RAM LOAD</span>
                <div className="text-lg font-mono font-bold text-slate-300">{baselineStation.metrics.ramUtil}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">GPU LOAD</span>
                <div className="text-lg font-mono font-bold text-slate-300">{baselineStation.metrics.gpuUtil}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">TEMP / POWER</span>
                <div className="text-xs font-mono font-bold text-slate-400 mt-1">{baselineStation.metrics.tempC}°C • {baselineStation.metrics.powerWatts}W</div>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={baselineStation.history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="cpu" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="gpu" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

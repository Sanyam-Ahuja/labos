import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { WORKLOAD_PROFILES } from '../../data/seedData';
import {
  X,
  Cpu,
  HardDrive,
  Zap,
  Thermometer,
  ShieldAlert,
  Play,
  Square,
  Wrench,
  CheckCircle,
  Power,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const MachineModal: React.FC = () => {
  const {
    workstations,
    selectedMachineId,
    setSelectedMachineId,
    startWorkload,
    stopWorkload,
    setMachineStatus,
    reportIncident,
  } = useLabStore();

  const [selectedProfileId, setSelectedProfileId] = useState(WORKLOAD_PROFILES[0].id);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  if (!selectedMachineId) return null;
  const ws = workstations.find((w) => w.id === selectedMachineId);
  if (!ws) return null;

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim()) return;
    reportIncident({
      workstationId: ws.id,
      labId: ws.labId,
      title: incidentTitle,
      description: incidentDesc,
      severity: incidentSeverity,
      status: 'investigating',
    });
    setShowIncidentForm(false);
    setIncidentTitle('');
    setIncidentDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={() => setSelectedMachineId(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-bold text-white">{ws.id}</span>
              <span className="text-xs font-mono text-slate-400">({ws.hostname})</span>
            </div>
            <p className="text-xs text-emerald-400 mt-0.5">{ws.labName} • Row {ws.row}, Column {ws.col}</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status switcher */}
            <select
              value={ws.status}
              onChange={(e) => setMachineStatus(ws.id, e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="available">Status: AVAILABLE</option>
              <option value="in_use">Status: IN USE</option>
              <option value="maintenance">Status: MAINTENANCE</option>
              <option value="offline">Status: OFFLINE</option>
            </select>
          </div>
        </div>

        {/* Live Gauges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CPU Utilization</span>
            <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">{ws.metrics.cpuUtil}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
              <div className="h-full bg-cyan-400" style={{ width: `${ws.metrics.cpuUtil}%` }} />
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">RAM Utilization</span>
            <div className="text-xl font-mono font-bold text-indigo-400 mt-0.5">{ws.metrics.ramUtil}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
              <div className="h-full bg-indigo-400" style={{ width: `${ws.metrics.ramUtil}%` }} />
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">GPU Load</span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{ws.metrics.gpuUtil}%</div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
              <div className="h-full bg-emerald-400" style={{ width: `${ws.metrics.gpuUtil}%` }} />
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Temperature</span>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{ws.metrics.tempC}°C</div>
            <span className="text-[10px] text-slate-500 font-mono">Die Sensor</span>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Power Draw</span>
            <div className="text-xl font-mono font-bold text-slate-200 mt-0.5">{ws.metrics.powerWatts} W</div>
            <span className="text-[10px] text-slate-500 font-mono">PSU Telemetry</span>
          </div>
        </div>

        {/* Real-time Telemetry History Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">Live Node Telemetry History</span>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-cyan-400">● CPU</span>
              <span className="text-indigo-400">● RAM</span>
              <span className="text-emerald-400">● GPU</span>
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ws.history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="ram" stroke="#818cf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="gpu" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Columns: Hardware Specs & Workload Controller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hardware Specs & Software */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardware Specification</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Processor:</span>
                <span className="text-slate-200 font-medium font-mono text-right">{ws.specs.cpu.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">RAM:</span>
                <span className="text-slate-200 font-mono">{ws.specs.ramGb} GB High-Speed DDR5</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Dedicated GPU:</span>
                <span className="text-emerald-400 font-mono font-medium">
                  {ws.specs.gpu ? ws.specs.gpu.model : 'Integrated GPU Only'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Storage:</span>
                <span className="text-slate-200 font-mono">{ws.specs.storageGb} GB NVMe SSD ({ws.metrics.storageUtil}% used)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Operating System:</span>
                <span className="text-slate-200">{ws.specs.os}</span>
              </div>
            </div>

            {/* Installed Software */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-1.5">Installed Stack & Tools:</span>
              <div className="flex flex-wrap gap-1">
                {ws.software.map((sw) => (
                  <span
                    key={sw}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono"
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Workload Simulation Controller & Fault Reporting */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Workload Simulator</span>
              </h4>

              {ws.activeWorkload ? (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">Active Simulation:</span>
                    <span className="text-[10px] font-mono text-amber-400 animate-pulse">● RUNNING</span>
                  </div>
                  <p className="text-xs text-white font-medium mb-1">{ws.activeWorkload.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mb-3">Started at {ws.activeWorkload.startedAt}</p>
                  <button
                    onClick={() => stopWorkload(ws.id)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Terminate Workload Simulation</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Assign a deterministic computing workload to simulate realistic CPU/GPU consumption:
                  </p>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {WORKLOAD_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => startWorkload(ws.id, selectedProfileId)}
                    disabled={ws.status === 'offline'}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Workload on Workstation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fault & Incident Reporting */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              {!showIncidentForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Hardware Fault / Incident</span>
                    <span className="text-[11px] text-slate-400">Report malfunction or flag for maintenance</span>
                  </div>
                  <button
                    onClick={() => setShowIncidentForm(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center space-x-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Report Fault</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportIncident} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400">File Incident Report</span>
                    <button
                      type="button"
                      onClick={() => setShowIncidentForm(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    placeholder="Brief title (e.g. Memory ECC errors)"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                  <textarea
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    placeholder="Details of the fault or observed error..."
                    rows={2}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={incidentSeverity}
                      onChange={(e) => setIncidentSeverity(e.target.value as any)}
                      className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-slate-300"
                    >
                      <option value="low">Severity: Low</option>
                      <option value="medium">Severity: Medium</option>
                      <option value="high">Severity: High</option>
                      <option value="critical">Severity: Critical</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

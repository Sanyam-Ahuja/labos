import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { Laboratory, Workstation, MachineStatus } from '../../types';
import { Layers, Cpu, Zap, Thermometer, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export const LabGrid: React.FC = () => {
  const { 
    laboratories, 
    workstations, 
    selectedLabId, 
    setSelectedLabId, 
    setSelectedMachineId,
    setActiveTab
  } = useLabStore();

  const currentLabId = selectedLabId || laboratories[0].id;
  const currentLab = laboratories.find((l) => l.id === currentLabId) || laboratories[0];

  const labWorkstations = workstations.filter((w) => w.labId === currentLabId);

  // Group by rows
  const rows: Workstation[][] = [];
  for (let r = 1; r <= currentLab.rows; r++) {
    const rowStations = labWorkstations
      .filter((w) => w.row === r)
      .sort((a, b) => a.col - b.col);
    rows.push(rowStations);
  }

  const getStatusBadge = (status: MachineStatus, hasWorkload: boolean) => {
    if (hasWorkload) {
      return (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
          <Zap className="w-2.5 h-2.5" />
          <span>RUNNING JOB</span>
        </span>
      );
    }
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AVAILABLE</span>
          </span>
        );
      case 'in_use':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>IN USE</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>MAINTENANCE</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-500 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>OFFLINE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Laboratory Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {laboratories.map((lab) => {
          const wsInLab = workstations.filter((w) => w.labId === lab.id);
          const availCount = wsInLab.filter((w) => w.status === 'available').length;
          const isSelected = lab.id === currentLabId;

          return (
            <button
              key={lab.id}
              onClick={() => setSelectedLabId(lab.id)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/30'
                  : 'bg-[#111827] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {lab.code}
                </span>
                <span className={`text-[11px] font-mono font-medium ${availCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {availCount}/{wsInLab.length} free
                </span>
              </div>
              <h4 className="font-semibold text-white text-xs truncate">{lab.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{lab.building} • {lab.room}</p>
            </button>
          );
        })}
      </div>

      {/* Spatial Seating Grid */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">{currentLab.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentLab.description}</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Legend:</span>
            <span className="flex items-center space-x-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Busy</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Maintenance</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Offline</span>
            </span>
          </div>
        </div>

        {/* Podium / Teacher Console Area */}
        <div className="w-full py-1.5 px-4 mb-6 rounded-lg bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
            [ FRONT OF LABORATORY — PROJECTION SCREEN & INSTRUMENTATION RACK ]
          </span>
        </div>

        {/* Workstations Grid Layout */}
        <div className="space-y-4">
          {rows.map((rowItems, rIdx) => (
            <div key={rIdx} className="space-y-1">
              <div className="text-[10px] font-mono text-slate-500 px-1">ROW {rIdx + 1}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {rowItems.map((ws) => {
                  const hasWorkload = ws.activeWorkload !== null;
                  const isAvailable = ws.status === 'available';
                  const isMaintenance = ws.status === 'maintenance';
                  const isOffline = ws.status === 'offline';

                  return (
                    <div
                      key={ws.id}
                      onClick={() => setSelectedMachineId(ws.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] relative group ${
                        hasWorkload
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/30'
                          : isAvailable
                          ? 'bg-slate-900/80 border-slate-700/60 hover:border-emerald-500/60'
                          : isMaintenance
                          ? 'bg-amber-950/10 border-amber-900/40 hover:border-amber-500/50'
                          : isOffline
                          ? 'bg-slate-950 border-slate-800 opacity-60'
                          : 'bg-blue-950/20 border-blue-900/40 hover:border-blue-500/50'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {ws.id}
                        </span>
                        {getStatusBadge(ws.status, hasWorkload)}
                      </div>

                      {/* Specs snippet */}
                      <div className="text-[11px] text-slate-300 font-medium truncate mb-2">
                        {ws.specs.gpu ? (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <Zap className="w-3 h-3 inline mr-0.5" />
                            {ws.specs.gpu.model.split('(')[0]}
                          </span>
                        ) : (
                          <span className="text-slate-400">{ws.specs.cpu.model.split('/')[0]}</span>
                        )}
                      </div>

                      {/* Live Meter Bars */}
                      {!isOffline ? (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>CPU</span>
                            <span className={ws.metrics.cpuUtil > 80 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                              {ws.metrics.cpuUtil}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full bg-cyan-400"
                              style={{ width: `${ws.metrics.cpuUtil}%` }}
                            />
                          </div>

                          {ws.specs.gpu && (
                            <>
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span>GPU</span>
                                <span className={ws.metrics.gpuUtil > 80 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                                  {ws.metrics.gpuUtil}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400"
                                  style={{ width: `${ws.metrics.gpuUtil}%` }}
                                />
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                            <span className="flex items-center space-x-1">
                              <Thermometer className="w-3 h-3 text-amber-500" />
                              <span>{ws.metrics.tempC}°C</span>
                            </span>
                            <span>{ws.specs.ramGb}GB RAM</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 text-center text-[11px] font-mono text-slate-500 border-t border-slate-800">
                          Powered Down / Offline
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

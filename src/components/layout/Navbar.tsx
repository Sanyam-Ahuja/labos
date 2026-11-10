import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { 
  Activity, 
  Server, 
  Cpu, 
  Layers, 
  Search, 
  Play, 
  Pause, 
  AlertTriangle, 
  RotateCcw,
  Zap,
  Radio,
  Sliders,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isSimulating, 
    toggleSimulation, 
    resetToDemoData, 
    workstations,
    incidents 
  } = useLabStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const runningWorkloads = workstations.filter(w => w.activeWorkload !== null).length;
  const totalNodes = workstations.length;
  const onlineNodes = workstations.filter(w => w.status !== 'offline').length;

  const navItems = [
    { id: 'overview' as const, label: 'Cluster Telemetry', icon: Activity, tag: 'NOC-01' },
    { id: 'laboratories' as const, label: 'Laboratory Grids', icon: Layers, tag: 'NOC-02' },
    { id: 'inventory' as const, label: 'Workstation Fleet', icon: Cpu, tag: `${onlineNodes}/${totalNodes}` },
    { id: 'software' as const, label: 'Software Catalog', icon: Search, tag: 'STACKS' },
    { id: 'simulator' as const, label: 'Workload Studio', icon: Zap, tag: runningWorkloads > 0 ? `${runningWorkloads} ACTIVE` : 'IDLE', highlight: runningWorkloads > 0 },
    { id: 'incidents' as const, label: 'Incident Console', icon: AlertTriangle, tag: activeIncidents > 0 ? `${activeIncidents} ALERTS` : 'CLEAR', alert: activeIncidents > 0 },
  ];

  return (
    <>
      {/* Desktop Left Rail Navigation (fixed w-64) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#152233] bg-[#070a12] flex-shrink-0 min-h-screen select-none">
        {/* Brand / NOC Identity */}
        <div className="p-4 border-b border-[#152233]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-black text-base tracking-wider text-white">Lab<span className="text-cyan-400">OS</span></span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-400 border border-cyan-500/30">
                  NOC
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">COMPUTING INFRASTRUCTURE</p>
            </div>
          </div>

          {/* Quick NOC Telemetry Status Pill */}
          <div className="mt-3.5 p-2 rounded-md bg-[#0a101b] border border-[#16253b] flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-semibold">{isSimulating ? 'TELEMETRY LIVE' : 'SIM PAUSED'}</span>
            </div>
            <span className="text-cyan-400/80 text-[9px] font-mono">3000ms</span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center justify-between">
          <span>OPERATIONAL PANELS</span>
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all text-left group ${
                  isActive
                    ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1422] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {/* Badge / Tag */}
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  item.alert
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40 animate-pulse'
                    : item.highlight
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : isActive
                    ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-700/30'
                    : 'bg-[#101a2b] text-slate-500'
                }`}>
                  {item.tag}
                </span>
              </button>
            );
          })}
        </nav>

        {/* NOC Telemetry & Operations Footer */}
        <div className="p-4 border-t border-[#152233] bg-[#05080e] space-y-2.5">
          <div className="p-2.5 rounded-md bg-[#090e17] border border-[#162335] text-[10px] font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500">FACILITY PUE</span>
              <span className="text-cyan-400 font-bold">1.18 RATIO</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500">GPU WORKLOADS</span>
              <span className="text-emerald-400 font-bold">{runningWorkloads} ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500">NODE UPTIME</span>
              <span className="text-slate-300">99.94%</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleSimulation}
              className={`px-2.5 py-2 rounded-md text-[11px] font-mono font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                isSimulating
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>RESUME</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-2 rounded-md text-[11px] font-mono font-bold bg-[#0d1624] text-slate-400 hover:text-white hover:bg-[#121e31] border border-[#1b2b42] flex items-center justify-center space-x-1.5 transition-all"
              title="Reset seeded demo dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar for small viewports */}
      <header className="lg:hidden border-b border-[#152233] bg-[#070a12] sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={() => setActiveTab('overview')}>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-mono font-black text-sm tracking-wider text-white">Lab<span className="text-cyan-400">OS</span></span>
              <span className="ml-1.5 text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">NOC</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSimulation}
              className={`px-2 py-1 rounded text-[10px] font-mono border ${
                isSimulating ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30' : 'bg-amber-950/50 text-amber-400 border-amber-500/30'
              }`}
            >
              {isSimulating ? 'PAUSE' : 'PLAY'}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1 rounded text-slate-400 border border-[#1b2b42]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1.5 pt-2.5 mt-2 border-t border-[#152233] no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b111a] border border-cyan-500/40 rounded-xl max-w-sm w-full p-5 shadow-2xl font-mono text-slate-200">
            <div className="flex items-center space-x-3 text-amber-400 mb-3">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Reset Telemetry Demo?</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
              This will restore all 52 workstations across the 4 campus laboratories, clear simulated workloads, and reseed clean hardware metric telemetry.
            </p>
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#152233]"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

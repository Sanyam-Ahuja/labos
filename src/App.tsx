import React, { useEffect } from 'react';
import { useLabStore } from './store/useLabStore';
import { Navbar } from './components/layout/Navbar';
import { OverviewView } from './components/dashboard/OverviewView';
import { LabGrid } from './components/laboratories/LabGrid';
import { WorkstationTable } from './components/inventory/WorkstationTable';
import { SoftwareDiscovery } from './components/software/SoftwareDiscovery';
import { WorkloadStudio } from './components/simulator/WorkloadStudio';
import { IncidentManager } from './components/incidents/IncidentManager';
import { MachineModal } from './components/machines/MachineModal';
import { Radio, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, tickSimulation, isSimulating, workstations } = useLabStore();

  // Deterministic simulation tick loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      tickSimulation();
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimulating, tickSimulation]);

  const activeNodes = workstations.filter((w) => w.status !== 'offline');
  const gpuNodes = activeNodes.filter((w) => w.specs.gpu !== null).length;

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Left Rail Sidebar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top NOC Telemetry Header */}
        <header className="border-b border-[#152233] bg-[#070b13]/90 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>NOC STREAM</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">
              SYS-SYNC: <strong className="text-white">ONLINE</strong>
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">
              4 FACILITIES (<span className="text-cyan-300">52 NODES</span>, <span className="text-emerald-400">{gpuNodes} ACCELERATED</span>)
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#0b111a] px-2.5 py-1 rounded border border-[#162335]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CLUSTER LOAD TIK-3s</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px]">ALL SUBSYSTEMS NOMINAL</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'laboratories' && <LabGrid />}
          {activeTab === 'inventory' && <WorkstationTable />}
          {activeTab === 'software' && <SoftwareDiscovery />}
          {activeTab === 'simulator' && <WorkloadStudio />}
          {activeTab === 'incidents' && <IncidentManager />}
        </main>

        {/* Machine Inspect Modal */}
        <MachineModal />

        {/* Datacenter Footer */}
        <footer className="border-t border-[#152233] bg-[#05080e] py-3.5 px-6 text-center text-xs text-slate-500 font-mono">
          <p>LabOS // Centralized Computing Infrastructure Operations • Smart Campus Technical Portfolio • Simulation Active</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

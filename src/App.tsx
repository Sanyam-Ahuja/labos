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

export const App: React.FC = () => {
  const { activeTab, tickSimulation, isSimulating } = useLabStore();

  // Deterministic simulation tick loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      tickSimulation();
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimulating, tickSimulation]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'laboratories' && <LabGrid />}
        {activeTab === 'inventory' && <WorkstationTable />}
        {activeTab === 'software' && <SoftwareDiscovery />}
        {activeTab === 'simulator' && <WorkloadStudio />}
        {activeTab === 'incidents' && <IncidentManager />}
      </main>

      <MachineModal />

      <footer className="border-t border-slate-800/80 bg-[#0E131F] py-4 text-center text-xs text-slate-500 font-mono">
        <p>LabOS Computing Infrastructure Platform • Smart Campus & Student Life • Standalone Client-Side Simulation</p>
      </footer>
    </div>
  );
};

export default App;

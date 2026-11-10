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

  useEffect(() => {
    if (!isSimulating) return;
    const t = setInterval(tickSimulation, 3000);
    return () => clearInterval(t);
  }, [isSimulating, tickSimulation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'laboratories' && <LabGrid />}
        {activeTab === 'inventory' && <WorkstationTable />}
        {activeTab === 'software' && <SoftwareDiscovery />}
        {activeTab === 'simulator' && <WorkloadStudio />}
        {activeTab === 'incidents' && <IncidentManager />}
      </main>
      <MachineModal />
      <footer className="border-t-[3px] border-ink">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between gap-1 text-[13px] text-graphite">
          <span>LabOS · facilities view for 4 teaching labs</span>
          <span>All telemetry on this page is simulated in your browser. Nothing touches real hardware.</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { Pause, Play, RotateCcw } from 'lucide-react';

type Tab = ReturnType<typeof useLabStore.getState>['activeTab'];

export const NAV: { id: Tab; code: string; label: string }[] = [
  { id: 'overview', code: 'A', label: 'Status board' },
  { id: 'laboratories', code: 'B', label: 'Floor plans' },
  { id: 'inventory', code: 'C', label: 'Machine fleet' },
  { id: 'software', code: 'D', label: 'Software' },
  { id: 'simulator', code: 'E', label: 'Workloads' },
  { id: 'incidents', code: 'F', label: 'Faults' },
];

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, isSimulating, toggleSimulation, resetToDemoData, incidents, workstations } = useLabStore();
  const [confirm, setConfirm] = useState(false);
  const openFaults = incidents.filter((i) => i.status !== 'resolved').length;
  const free = workstations.filter((w) => w.status === 'available').length;

  return (
    <header className="bg-ink text-concrete sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-stretch gap-6 h-16">
        <button onClick={() => setActiveTab('overview')} className="flex items-center gap-3 shrink-0" aria-label="LabOS home">
          <span className="bg-hazard text-ink sign text-[26px] px-2 py-1 leading-none">LabOS</span>
          <span className="hidden xl:block text-[13px] leading-tight text-idle">
            Computing Facilities<br />Alan Turing Computing Centre
          </span>
        </button>

        <nav className="hidden lg:flex items-stretch flex-1" aria-label="Sections">
          {NAV.map((n) => {
            const on = activeTab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setActiveTab(n.id)}
                className={`flex items-center gap-2 px-2.5 xl:px-3.5 border-b-4 transition-colors ${
                  on ? 'border-hazard text-white' : 'border-transparent text-idle hover:text-white'
                }`}
                aria-current={on ? 'page' : undefined}
              >
                <span className={`sign text-[15px] w-6 h-6 grid place-items-center ${on ? 'bg-hazard text-ink' : 'border border-current'}`}>{n.code}</span>
                <span className="sign text-[18px] font-semibold whitespace-nowrap">{n.label}</span>
                {n.id === 'incidents' && openFaults > 0 && (
                  <span className="sign bg-stop text-white text-[13px] px-1.5 py-0.5">{openFaults}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <span className="hidden 2xl:flex items-center gap-2 text-[13px] text-idle mr-2 whitespace-nowrap">
            <span className={`w-2.5 h-2.5 ${isSimulating ? 'bg-safe blink-slow' : 'bg-hazard'}`} />
            {isSimulating ? 'Telemetry sim · 3 s' : 'Sim paused'}
          </span>
          <button onClick={toggleSimulation} className="p-2 border border-graphite hover:border-hazard hover:text-hazard" title={isSimulating ? 'Pause simulation' : 'Resume simulation'}>
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={() => setConfirm(true)} className="p-2 border border-graphite hover:border-hazard hover:text-hazard" title="Reset demo data">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* mobile directory */}
      <nav className="lg:hidden flex overflow-x-auto border-t border-graphite" aria-label="Sections">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveTab(n.id)}
            className={`sign text-[16px] px-3 py-2.5 whitespace-nowrap flex items-center gap-1.5 ${activeTab === n.id ? 'bg-hazard text-ink' : 'text-idle'}`}
          >
            <span>{n.code}</span>{n.label}
          </button>
        ))}
      </nav>
      <div className="hazard-stripe h-1.5" />

      {confirm && (
        <div className="fixed inset-0 z-50 bg-ink/70 grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="plate text-ink max-w-md w-full">
            <div className="hazard-stripe h-3" />
            <div className="p-6">
              <h2 className="sign text-[32px]">Reset demo data?</h2>
              <p className="text-graphite mt-2">
                All 52 workstations return to their seeded state, running jobs stop and the fault log is restored. {free} machines are free right now.
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <button className="btn" onClick={() => setConfirm(false)}>Keep current</button>
                <button className="btn btn-primary" onClick={() => { resetToDemoData(); setConfirm(false); }}>Reset everything</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

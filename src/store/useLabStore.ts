import { create } from 'zustand';
import { Workstation, Laboratory, IncidentReport, MachineStatus } from '../types';
import { LABORATORIES, INITIAL_INCIDENTS, generateInitialWorkstations, WORKLOAD_PROFILES } from '../data/seedData';
import { advanceMetrics } from '../engine/simulator';

interface LabState {
  workstations: Workstation[];
  laboratories: Laboratory[];
  incidents: IncidentReport[];
  selectedMachineId: string | null;
  activeTab: 'overview' | 'laboratories' | 'inventory' | 'software' | 'simulator' | 'incidents';
  filterGpuOnly: boolean;
  filterStatus: 'all' | MachineStatus;
  searchQuery: string;
  selectedLabId: string | null;
  isSimulating: boolean;

  // Actions
  tickSimulation: () => void;
  toggleSimulation: () => void;
  setActiveTab: (tab: LabState['activeTab']) => void;
  setSelectedMachineId: (id: string | null) => void;
  setSelectedLabId: (labId: string | null) => void;
  setFilterGpuOnly: (val: boolean) => void;
  setFilterStatus: (val: 'all' | MachineStatus) => void;
  setSearchQuery: (query: string) => void;
  
  startWorkload: (wsId: string, profileId: string) => void;
  stopWorkload: (wsId: string) => void;
  setMachineStatus: (wsId: string, status: MachineStatus) => void;
  reportIncident: (report: Omit<IncidentReport, 'id' | 'reportedAt'>) => void;
  resolveIncident: (id: string) => void;
  resetToDemoData: () => void;
}

const STORAGE_KEY = 'labos_state_v1';

function loadPersistedState(): { workstations: Workstation[]; incidents: IncidentReport[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.workstations && parsed.incidents) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load persisted LabOS state:', err);
  }
  return {
    workstations: generateInitialWorkstations(),
    incidents: INITIAL_INCIDENTS,
  };
}

function saveState(workstations: Workstation[], incidents: IncidentReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ workstations, incidents }));
  } catch (err) {
    console.warn('Failed to persist LabOS state:', err);
  }
}

const initialData = loadPersistedState();

export const useLabStore = create<LabState>((set, get) => ({
  workstations: initialData.workstations,
  laboratories: LABORATORIES,
  incidents: initialData.incidents,
  selectedMachineId: null,
  activeTab: 'overview',
  filterGpuOnly: false,
  filterStatus: 'all',
  searchQuery: '',
  selectedLabId: null,
  isSimulating: true,

  tickSimulation: () => {
    if (!get().isSimulating) return;
    set((state) => {
      const updated = state.workstations.map((ws) => advanceMetrics(ws));
      saveState(updated, state.incidents);
      return { workstations: updated };
    });
  },

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedMachineId: (id) => set({ selectedMachineId: id }),
  setSelectedLabId: (labId) => set({ selectedLabId: labId }),
  setFilterGpuOnly: (val) => set({ filterGpuOnly: val }),
  setFilterStatus: (val) => set({ filterStatus: val }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  startWorkload: (wsId, profileId) => {
    const profile = WORKLOAD_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;

    set((state) => {
      const updated = state.workstations.map((ws) => {
        if (ws.id === wsId) {
          return {
            ...ws,
            status: 'in_use' as MachineStatus,
            activeWorkload: {
              id: profile.id,
              name: profile.name,
              type: profile.type,
              startedAt: new Date().toLocaleTimeString(),
            },
          };
        }
        return ws;
      });
      saveState(updated, state.incidents);
      return { workstations: updated };
    });
  },

  stopWorkload: (wsId) => {
    set((state) => {
      const updated = state.workstations.map((ws) => {
        if (ws.id === wsId) {
          return {
            ...ws,
            status: 'available' as MachineStatus,
            activeWorkload: null,
          };
        }
        return ws;
      });
      saveState(updated, state.incidents);
      return { workstations: updated };
    });
  },

  setMachineStatus: (wsId, status) => {
    set((state) => {
      const updated = state.workstations.map((ws) => {
        if (ws.id === wsId) {
          return {
            ...ws,
            status,
            activeWorkload: status === 'offline' || status === 'maintenance' ? null : ws.activeWorkload,
          };
        }
        return ws;
      });
      saveState(updated, state.incidents);
      return { workstations: updated };
    });
  },

  reportIncident: (report) => {
    const newIncident: IncidentReport = {
      ...report,
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: 'Just now',
    };
    set((state) => {
      const updatedIncidents = [newIncident, ...state.incidents];
      const updatedWorkstations = state.workstations.map((ws) => {
        if (ws.id === report.workstationId) {
          return { ...ws, status: 'maintenance' as MachineStatus, activeWorkload: null };
        }
        return ws;
      });
      saveState(updatedWorkstations, updatedIncidents);
      return { incidents: updatedIncidents, workstations: updatedWorkstations };
    });
  },

  resolveIncident: (id) => {
    set((state) => {
      let resolvedWsId: string | null = null;
      const updatedIncidents = state.incidents.map((inc) => {
        if (inc.id === id) {
          resolvedWsId = inc.workstationId;
          return {
            ...inc,
            status: 'resolved' as const,
            resolvedAt: new Date().toLocaleTimeString(),
          };
        }
        return inc;
      });

      const updatedWorkstations = state.workstations.map((ws) => {
        if (ws.id === resolvedWsId && ws.status === 'maintenance') {
          return { ...ws, status: 'available' as MachineStatus };
        }
        return ws;
      });

      saveState(updatedWorkstations, updatedIncidents);
      return { incidents: updatedIncidents, workstations: updatedWorkstations };
    });
  },

  resetToDemoData: () => {
    localStorage.removeItem(STORAGE_KEY);
    const freshWorkstations = generateInitialWorkstations();
    const freshIncidents = INITIAL_INCIDENTS;
    saveState(freshWorkstations, freshIncidents);
    set({
      workstations: freshWorkstations,
      incidents: freshIncidents,
      selectedMachineId: null,
      searchQuery: '',
      filterGpuOnly: false,
      filterStatus: 'all',
      selectedLabId: null,
    });
  },
}));

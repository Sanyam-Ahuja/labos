export type MachineStatus = 'available' | 'in_use' | 'offline' | 'maintenance';

export type WorkloadType = 'ml_training' | 'raytracing' | 'compilation' | 'simulation';

export interface WorkloadProfile {
  id: string;
  name: string;
  type: WorkloadType;
  description: string;
  targetCpu: number;
  targetRam: number;
  targetGpu: number;
  tempDelta: number;
  powerDelta: number;
}

export interface MetricSnapshot {
  time: string;
  timestamp: number;
  cpu: number;
  ram: number;
  gpu: number;
  temp: number;
}

export interface WorkstationSpecs {
  cpu: {
    model: string;
    cores: number;
    baseFreqGhz: number;
  };
  ramGb: number;
  gpu: {
    model: string;
    vramGb: number;
    cudaCores?: number;
  } | null;
  storageGb: number;
  os: string;
}

export interface Workstation {
  id: string;
  hostname: string;
  labId: string;
  labName: string;
  row: number;
  col: number;
  status: MachineStatus;
  specs: WorkstationSpecs;
  software: string[];
  metrics: {
    cpuUtil: number;
    ramUtil: number;
    gpuUtil: number;
    tempC: number;
    powerWatts: number;
    storageUtil: number;
  };
  activeWorkload: {
    id: string;
    name: string;
    type: WorkloadType;
    startedAt: string;
  } | null;
  history: MetricSnapshot[];
}

export interface Laboratory {
  id: string;
  name: string;
  code: string;
  building: string;
  room: string;
  description: string;
  rows: number;
  cols: number;
  gpuLab: boolean;
}

export interface IncidentReport {
  id: string;
  workstationId: string;
  labId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'resolved';
  reportedAt: string;
  resolvedAt?: string;
}

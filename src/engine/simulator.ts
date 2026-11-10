import { Workstation, WorkloadProfile, IncidentReport } from '../types';
import { WORKLOAD_PROFILES } from '../data/seedData';

export function advanceMetrics(workstation: Workstation): Workstation {
  if (workstation.status === 'offline') {
    const updated = {
      ...workstation,
      metrics: {
        ...workstation.metrics,
        cpuUtil: 0,
        ramUtil: 0,
        gpuUtil: 0,
        tempC: 23,
        powerWatts: 4,
      },
    };
    return appendHistory(updated);
  }

  if (workstation.status === 'maintenance') {
    const updated = {
      ...workstation,
      metrics: {
        ...workstation.metrics,
        cpuUtil: 2 + Math.floor(Math.random() * 3),
        ramUtil: 14,
        gpuUtil: 0,
        tempC: 32,
        powerWatts: 45,
      },
    };
    return appendHistory(updated);
  }

  let targetCpu = 8;
  let targetRam = 22;
  let targetGpu = 0;
  let targetTemp = 38;
  let targetPower = 95;

  if (workstation.activeWorkload) {
    const profile = WORKLOAD_PROFILES.find((p) => p.id === workstation.activeWorkload?.id);
    if (profile) {
      targetCpu = profile.targetCpu;
      targetRam = profile.targetRam;
      targetGpu = workstation.specs.gpu ? profile.targetGpu : 0;
      targetTemp = 42 + profile.tempDelta;
      targetPower = 110 + profile.powerDelta;
    }
  } else if (workstation.status === 'in_use') {
    targetCpu = 50 + (parseInt(workstation.id.slice(-2), 10) % 35);
    targetRam = 55 + (parseInt(workstation.id.slice(-2), 10) % 30);
    targetGpu = workstation.specs.gpu ? 40 + (parseInt(workstation.id.slice(-2), 10) % 45) : 0;
    targetTemp = 58;
    targetPower = 180;
  }

  // Smooth interpolation + small deterministic jitter
  const jitterCpu = (Math.random() - 0.5) * 6;
  const jitterRam = (Math.random() - 0.5) * 3;
  const jitterGpu = (Math.random() - 0.5) * 5;
  const jitterTemp = (Math.random() - 0.5) * 2;

  const newCpu = Math.min(100, Math.max(1, Math.round(workstation.metrics.cpuUtil * 0.7 + targetCpu * 0.3 + jitterCpu)));
  const newRam = Math.min(100, Math.max(8, Math.round(workstation.metrics.ramUtil * 0.8 + targetRam * 0.2 + jitterRam)));
  const newGpu = Math.min(100, Math.max(0, Math.round(workstation.metrics.gpuUtil * 0.7 + targetGpu * 0.3 + jitterGpu)));
  const newTemp = Math.min(96, Math.max(28, Math.round(workstation.metrics.tempC * 0.85 + targetTemp * 0.15 + jitterTemp)));
  const newPower = Math.round(targetPower + (newCpu + newGpu) * 1.2);

  const updated: Workstation = {
    ...workstation,
    metrics: {
      ...workstation.metrics,
      cpuUtil: newCpu,
      ramUtil: newRam,
      gpuUtil: workstation.specs.gpu ? newGpu : 0,
      tempC: newTemp,
      powerWatts: newPower,
    },
  };

  return appendHistory(updated);
}

function appendHistory(ws: Workstation): Workstation {
  const now = new Date();
  const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  const newEntry = {
    time,
    timestamp: now.getTime(),
    cpu: ws.metrics.cpuUtil,
    ram: ws.metrics.ramUtil,
    gpu: ws.metrics.gpuUtil,
    temp: ws.metrics.tempC,
  };

  const newHistory = [...ws.history.slice(-14), newEntry];
  return {
    ...ws,
    history: newHistory,
  };
}

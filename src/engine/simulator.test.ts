import { describe, it, expect } from 'vitest';
import { generateInitialWorkstations, WORKLOAD_PROFILES, LABORATORIES } from '../data/seedData';
import { advanceMetrics } from './simulator';
import { Workstation } from '../types';

describe('LabOS Infrastructure Engine', () => {
  it('generates between 40 and 60 realistic seeded workstations across 4 labs', () => {
    const stations = generateInitialWorkstations();
    expect(stations.length).toBeGreaterThanOrEqual(40);
    expect(stations.length).toBeLessThanOrEqual(60);

    const labIds = new Set(stations.map((s) => s.labId));
    expect(labIds.size).toBe(4);
    expect(LABORATORIES.length).toBe(4);
  });

  it('keeps offline machines at 0 utilization', () => {
    const stations = generateInitialWorkstations();
    const offlineStation = stations.find((s) => s.status === 'offline') || {
      ...stations[0],
      status: 'offline' as const,
    };

    const advanced = advanceMetrics(offlineStation);
    expect(advanced.metrics.cpuUtil).toBe(0);
    expect(advanced.metrics.gpuUtil).toBe(0);
  });

  it('elevates GPU and temperature metrics when an ML workload is active', () => {
    const stations = generateInitialWorkstations();
    const gpuStation = stations.find((s) => s.specs.gpu !== null && s.status === 'available')!;
    expect(gpuStation).toBeDefined();

    const mlProfile = WORKLOAD_PROFILES.find((p) => p.type === 'ml_training')!;
    const stationWithJob: Workstation = {
      ...gpuStation,
      activeWorkload: {
        id: mlProfile.id,
        name: mlProfile.name,
        type: mlProfile.type,
        startedAt: '12:00:00',
      },
    };

    let stepped: Workstation = stationWithJob;
    // Step simulation 4 times
    for (let i = 0; i < 4; i++) {
      stepped = advanceMetrics(stepped);
    }

    // Should ramp up GPU utilization near target
    expect(stepped.metrics.gpuUtil).toBeGreaterThan(60);
    expect(stepped.metrics.tempC).toBeGreaterThan(50);
  });

  it('tracks rolling metric history snapshots', () => {
    const stations = generateInitialWorkstations();
    const station = stations[0];
    const initialHistoryLength = station.history.length;

    const stepped = advanceMetrics(station);
    expect(stepped.history.length).toBeGreaterThanOrEqual(initialHistoryLength);
    const lastEntry = stepped.history[stepped.history.length - 1];
    expect(lastEntry).toHaveProperty('time');
    expect(lastEntry).toHaveProperty('cpu');
    expect(lastEntry).toHaveProperty('gpu');
  });
});

import { Laboratory, Workstation, IncidentReport, WorkloadProfile } from '../types';

export const WORKLOAD_PROFILES: WorkloadProfile[] = [
  {
    id: 'ml_llm_finetune',
    name: 'LLM LoRA Fine-Tuning (PyTorch)',
    type: 'ml_training',
    description: 'FP16 transformer matrix multiplication and gradient accumulation on CUDA tensor cores.',
    targetCpu: 75,
    targetRam: 88,
    targetGpu: 96,
    tempDelta: 24,
    powerDelta: 220,
  },
  {
    id: 'blender_cycles_render',
    name: 'Blender 4.1 Cycles Raytracing',
    type: 'raytracing',
    description: 'OptiX accelerated path-tracing with 1024 samples per pixel and tile denoising.',
    targetCpu: 85,
    targetRam: 72,
    targetGpu: 98,
    tempDelta: 28,
    powerDelta: 250,
  },
  {
    id: 'llvm_parallel_build',
    name: 'Clang/LLVM 18 Parallel Compilation',
    type: 'compilation',
    description: '32-thread ninja compilation pass with heavy link-time optimization (LTO) memory footprint.',
    targetCpu: 97,
    targetRam: 84,
    targetGpu: 8,
    tempDelta: 22,
    powerDelta: 175,
  },
  {
    id: 'fluid_cfd_simulation',
    name: 'OpenFOAM Aerodynamics Simulation',
    type: 'simulation',
    description: 'Navier-Stokes grid mesh computation with intensive floating point and cache thrashing.',
    targetCpu: 92,
    targetRam: 90,
    targetGpu: 45,
    tempDelta: 20,
    powerDelta: 190,
  },
];

export const LABORATORIES: Laboratory[] = [
  {
    id: 'turing-ai',
    name: 'Turing High-Performance AI & Deep Learning Lab',
    code: 'LAB-AI-302',
    building: 'Alan Turing Computing Center',
    room: 'Room 302',
    description: 'Specialized for deep neural network research, LLM acceleration, and computer vision.',
    rows: 4,
    cols: 4,
    gpuLab: true,
  },
  {
    id: 'hopper-graphics',
    name: 'Grace Hopper Interactive Graphics Studio',
    code: 'LAB-GFX-114',
    building: 'Digital Media Complex',
    room: 'Room 114',
    description: 'Equipped for 3D modeling, real-time shaders, game engines, and scientific visualization.',
    rows: 3,
    cols: 4,
    gpuLab: true,
  },
  {
    id: 'neumann-systems',
    name: 'Von Neumann Systems & Architecture Lab',
    code: 'LAB-SYS-205',
    building: 'Computing Quad West',
    room: 'Room 205',
    description: 'Host for OS kernel hacking, distributed systems, embedded tooling, and compiler optimization.',
    rows: 3,
    cols: 4,
    gpuLab: false,
  },
  {
    id: 'lovelace-general',
    name: 'Ada Lovelace General Computing Lab',
    code: 'LAB-GEN-101',
    building: 'Engineering Annex',
    room: 'Room 101',
    description: 'Undergraduate development laboratory for algorithms, database systems, and collaborative coursework.',
    rows: 3,
    cols: 4,
    gpuLab: false,
  },
];

const GPU_MODELS = [
  { model: 'NVIDIA RTX 4090 (24GB)', vramGb: 24, cudaCores: 16384 },
  { model: 'NVIDIA RTX A5000 (24GB)', vramGb: 24, cudaCores: 8192 },
  { model: 'NVIDIA RTX 4080 (16GB)', vramGb: 16, cudaCores: 9728 },
  { model: 'NVIDIA RTX 3080 Ti (12GB)', vramGb: 12, cudaCores: 10240 },
  { model: 'NVIDIA RTX 3060 (12GB)', vramGb: 12, cudaCores: 3584 },
];

const SOFTWARE_SETS = {
  ai: [
    'CUDA 12.4', 'PyTorch 2.3', 'TensorFlow 2.16', 'JAX 0.4', 'HuggingFace Transformers',
    'JupyterLab 4.1', 'Python 3.11', 'VS Code', 'Docker Engine', 'Weights & Biases',
  ],
  graphics: [
    'Blender 4.1', 'Unreal Engine 5.4', 'Maya 2024', 'CUDA 12.2', 'OpenGL / Vulkan SDK',
    'Substance Painter', 'Unity 2023 LTS', 'VS Code', 'Python 3.10',
  ],
  systems: [
    'GCC 13.2', 'Clang / LLVM 18', 'Rust 1.78', 'GDB / Valgrind', 'QEMU 8.2',
    'Docker Engine', 'CMake 3.28', 'Go 1.22', 'Wireshark', 'Linux Kernel 6.8 Dev Tools',
  ],
  general: [
    'VS Code', 'Python 3.11', 'Node.js 20 LTS', 'Java JDK 21', 'PostgreSQL 16 Client',
    'Git / GitHub CLI', 'MATLAB R2024a', 'IntelliJ IDEA', 'Docker Desktop',
  ],
};

function generateHistory(baseCpu: number, baseRam: number, baseGpu: number, baseTemp: number) {
  const points = [];
  const now = Date.now();
  for (let i = 12; i >= 0; i--) {
    const timestamp = now - i * 5000;
    const date = new Date(timestamp);
    const time = `${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    const jitter = Math.sin(i * 0.7) * 4;
    points.push({
      time,
      timestamp,
      cpu: Math.min(100, Math.max(2, Math.round(baseCpu + jitter))),
      ram: Math.min(100, Math.max(10, Math.round(baseRam + jitter * 0.5))),
      gpu: Math.min(100, Math.max(0, Math.round(baseGpu + jitter * 0.8))),
      temp: Math.min(95, Math.max(30, Math.round(baseTemp + jitter * 0.3))),
    });
  }
  return points;
}

export function generateInitialWorkstations(): Workstation[] {
  const workstations: Workstation[] = [];

  LABORATORIES.forEach((lab) => {
    let index = 1;
    for (let r = 1; r <= lab.rows; r++) {
      for (let c = 1; c <= lab.cols; c++) {
        const idNum = index.toString().padStart(2, '0');
        const wsId = `${lab.code.replace('LAB-', 'WS-')}-${idNum}`;
        const hostname = `${lab.id}-node-${idNum}.campus.lan`;

        let status: Workstation['status'] = 'available';
        if (index % 7 === 0) status = 'offline';
        else if (index % 5 === 0) status = 'maintenance';
        else if (index % 2 === 0 || index % 3 === 0) status = 'in_use';

        let specs: Workstation['specs'];
        let software: string[];
        let baseCpu = status === 'in_use' ? 55 + (index % 30) : 8 + (index % 10);
        let baseRam = status === 'in_use' ? 62 + (index % 25) : 22 + (index % 8);
        let baseGpu = 0;
        let baseTemp = status === 'in_use' ? 58 + (index % 15) : 38 + (index % 6);

        if (lab.id === 'turing-ai') {
          const gpuChoice = GPU_MODELS[index % 3]; // 4090 or A5000 or 4080
          specs = {
            cpu: { model: 'AMD EPYC 7763 64-Core / AMD Ryzen 9 7950X', cores: 32, baseFreqGhz: 4.5 },
            ramGb: 128,
            gpu: gpuChoice,
            storageGb: 2048,
            os: 'Ubuntu 22.04 LTS (Jammy)',
          };
          software = [...SOFTWARE_SETS.ai];
          baseGpu = status === 'in_use' ? 70 + (index % 25) : 4;
        } else if (lab.id === 'hopper-graphics') {
          const gpuChoice = GPU_MODELS[2 + (index % 3)]; // 4080, 3080Ti, 3060
          specs = {
            cpu: { model: 'Intel Core i9-14900K 24-Core', cores: 24, baseFreqGhz: 3.2 },
            ramGb: 64,
            gpu: gpuChoice,
            storageGb: 1024,
            os: 'Windows 11 Pro Enterprise',
          };
          software = [...SOFTWARE_SETS.graphics];
          baseGpu = status === 'in_use' ? 65 + (index % 28) : 5;
        } else if (lab.id === 'neumann-systems') {
          specs = {
            cpu: { model: 'AMD Ryzen 9 7900X 12-Core', cores: 12, baseFreqGhz: 4.7 },
            ramGb: 64,
            gpu: index % 4 === 0 ? GPU_MODELS[4] : null,
            storageGb: 1024,
            os: 'Arch Linux (Kernel 6.8)',
          };
          software = [...SOFTWARE_SETS.systems];
          baseGpu = specs.gpu && status === 'in_use' ? 30 : 0;
        } else {
          // lovelace-general
          specs = {
            cpu: { model: 'Intel Core i7-13700 16-Core', cores: 16, baseFreqGhz: 2.1 },
            ramGb: 32,
            gpu: null,
            storageGb: 512,
            os: 'Fedora Workstation 39',
          };
          software = [...SOFTWARE_SETS.general];
          baseGpu = 0;
        }

        if (status === 'offline') {
          baseCpu = 0;
          baseRam = 0;
          baseGpu = 0;
          baseTemp = 24;
        } else if (status === 'maintenance') {
          baseCpu = 3;
          baseRam = 12;
          baseGpu = 0;
          baseTemp = 32;
        }

        workstations.push({
          id: wsId,
          hostname,
          labId: lab.id,
          labName: lab.name,
          row: r,
          col: c,
          status,
          specs,
          software,
          metrics: {
            cpuUtil: baseCpu,
            ramUtil: baseRam,
            gpuUtil: baseGpu,
            tempC: baseTemp,
            powerWatts: status === 'offline' ? 4 : Math.round(90 + (baseCpu + baseGpu) * 2.2),
            storageUtil: 35 + (index * 7) % 55,
          },
          activeWorkload: null,
          history: generateHistory(baseCpu, baseRam, baseGpu, baseTemp),
        });

        index++;
      }
    }
  });

  return workstations;
}

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'INC-2026-081',
    workstationId: 'WS-AI-302-07',
    labId: 'turing-ai',
    title: 'PCIe GPU Bus Remapped / Driver Dropout',
    description: 'NVIDIA driver dropped RTX 4090 off the bus during mixed-precision autograd pass. Thermal throttling suspected.',
    severity: 'critical',
    status: 'investigating',
    reportedAt: '12 minutes ago',
  },
  {
    id: 'INC-2026-079',
    workstationId: 'WS-GFX-114-10',
    labId: 'hopper-graphics',
    title: 'DisplayPort 1.4 Link Training Degradation',
    description: 'Monitor flickers at 144Hz refresh rate during viewport navigation in Blender.',
    severity: 'medium',
    status: 'identified',
    reportedAt: '1 hour ago',
  },
  {
    id: 'INC-2026-074',
    workstationId: 'WS-SYS-205-04',
    labId: 'neumann-systems',
    title: 'ECC Memory Single-Bit Flips in Rowhammer Test',
    description: 'Memory controller flagged 14 corrected single-bit parity errors on Bank 2 DIMM A.',
    severity: 'high',
    status: 'investigating',
    reportedAt: '3 hours ago',
  },
  {
    id: 'INC-2026-069',
    workstationId: 'WS-GEN-101-12',
    labId: 'lovelace-general',
    title: 'Network Interface Cable Defect',
    description: '1GbE link autonegotiates down to 100Mbps half-duplex due to kinked Cat6 patch cable.',
    severity: 'low',
    status: 'resolved',
    reportedAt: 'Yesterday',
    resolvedAt: 'Today 09:15',
  },
];

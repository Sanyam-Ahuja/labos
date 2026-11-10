import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

export const ClusterTelemetryChart: React.FC = () => {
  const { workstations } = useLabStore();

  // Aggregate the history across all workstations
  // We use the first workstation's timestamps as reference
  const refNode = workstations[0];
  const historyData = refNode.history.map((snapshot, idx) => {
    let sumCpu = 0;
    let sumRam = 0;
    let sumGpu = 0;
    let gpuCount = 0;
    let activeCount = 0;

    workstations.forEach((ws) => {
      if (ws.status !== 'offline') {
        activeCount++;
        const point = ws.history[idx] || ws.history[ws.history.length - 1];
        if (point) {
          sumCpu += point.cpu;
          sumRam += point.ram;
          if (ws.specs.gpu) {
            sumGpu += point.gpu;
            gpuCount++;
          }
        }
      }
    });

    return {
      time: snapshot.time,
      avgCpu: Math.round(sumCpu / (activeCount || 1)),
      avgRam: Math.round(sumRam / (activeCount || 1)),
      avgGpu: Math.round(sumGpu / (gpuCount || 1)),
    };
  });

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Cluster Real-time Telemetry (52 Nodes)</h3>
          </div>
          <p className="text-xs text-slate-400">Continuous resource consumption trends across all lab facilities</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span className="text-slate-300">CPU</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
            <span className="text-slate-300">RAM</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-slate-300">GPU</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Area
              type="monotone"
              dataKey="avgCpu"
              name="Avg CPU"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#cpuGradient)"
            />
            <Area
              type="monotone"
              dataKey="avgRam"
              name="Avg RAM"
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ramGradient)"
            />
            <Area
              type="monotone"
              dataKey="avgGpu"
              name="Avg GPU"
              stroke="#34d399"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gpuGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

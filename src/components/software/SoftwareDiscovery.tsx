import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { Search, Code2, Zap, CheckCircle2, ChevronRight, Laptop, Layers } from 'lucide-react';

export const SoftwareDiscovery: React.FC = () => {
  const { workstations, setSelectedMachineId } = useLabStore();
  const [selectedTag, setSelectedTag] = useState<string>('CUDA 12.4');
  const [search, setSearch] = useState('');

  // Collect all unique software tags
  const allSoftware = Array.from(
    new Set(workstations.flatMap((w) => w.software))
  ).sort();

  const filteredTags = allSoftware.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const matchingStations = workstations.filter((w) =>
    w.software.includes(selectedTag)
  );

  const availableCount = matchingStations.filter((w) => w.status === 'available').length;
  const gpuCount = matchingStations.filter((w) => w.specs.gpu !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <Code2 className="w-5 h-5" />
              <h3 className="font-bold text-white text-lg">Installed Software Discovery</h3>
            </div>
            <p className="text-xs text-slate-400">
              Find physical workstations pre-configured with specialized toolchains, AI libraries, 3D suites, and compiler frameworks.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <strong className="text-emerald-400">{allSoftware.length}</strong> software packages cataloged
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Software Tags Selector */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search software package..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex flex-col space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredTags.map((sw) => {
              const count = workstations.filter((w) => w.software.includes(sw)).length;
              const isSelected = sw === selectedTag;
              return (
                <button
                  key={sw}
                  onClick={() => setSelectedTag(sw)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span className="font-mono truncate">{sw}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workstations Matching Selected Software */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase text-slate-400">Package Selected:</span>
                <span className="font-mono font-bold text-white text-base">{selectedTag}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                <span><strong>{matchingStations.length}</strong> matching machines</span>
                <span>•</span>
                <span className="text-emerald-400"><strong>{availableCount}</strong> available right now</span>
                <span>•</span>
                <span className="text-cyan-400"><strong>{gpuCount}</strong> with dedicated GPU</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {matchingStations.map((ws) => (
              <div
                key={ws.id}
                onClick={() => setSelectedMachineId(ws.id)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {ws.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      ws.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : ws.status === 'in_use'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {ws.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mb-2 truncate">
                  {ws.labName} • {ws.specs.os.split(' ')[0]}
                </div>

                <div className="space-y-1 text-xs border-t border-slate-800/80 pt-2 font-mono">
                  <div className="text-[11px] text-slate-300 truncate">
                    {ws.specs.gpu ? (
                      <span className="text-emerald-400 flex items-center">
                        <Zap className="w-3 h-3 mr-1 inline" />
                        {ws.specs.gpu.model}
                      </span>
                    ) : (
                      <span className="text-slate-400">CPU: {ws.specs.cpu.cores} Cores ({ws.specs.ramGb}GB RAM)</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>CPU: {ws.metrics.cpuUtil}%</span>
                    <span>GPU: {ws.metrics.gpuUtil}%</span>
                    <span>{ws.metrics.tempC}°C</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

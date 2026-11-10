import React, { useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { ShieldAlert, CheckCircle2, AlertOctagon, Wrench, Plus, Clock, ExternalLink } from 'lucide-react';

export const IncidentManager: React.FC = () => {
  const { incidents, resolveIncident, reportIncident, workstations, setSelectedMachineId } = useLabStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [targetWsId, setTargetWsId] = useState(workstations[0]?.id || '');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  const filtered = incidents.filter((inc) => {
    if (filter === 'open') return inc.status !== 'resolved';
    if (filter === 'resolved') return inc.status === 'resolved';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ws = workstations.find((w) => w.id === targetWsId);
    reportIncident({
      workstationId: targetWsId,
      labId: ws ? ws.labId : 'turing-ai',
      title,
      description: desc,
      severity,
      status: 'investigating',
    });
    setShowAddModal(false);
    setTitle('');
    setDesc('');
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold uppercase">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 uppercase">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 uppercase">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 mb-1">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-white text-lg">Hardware Incidents & Fault Tracking</h3>
          </div>
          <p className="text-xs text-slate-400">
            Lifecycle monitoring for thermal throttling, driver dropouts, parity errors, and physical workstation maintenance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-rose-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Incidents ({incidents.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filter === 'open' ? 'bg-slate-800 text-rose-400 border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          Open / Active ({incidents.filter((i) => i.status !== 'resolved').length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            filter === 'resolved' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          Resolved ({incidents.filter((i) => i.status === 'resolved').length})
        </button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-300">{inc.id}</span>
                {getSeverityBadge(inc.severity)}
                <span className="text-[11px] font-mono text-slate-500">• Reported {inc.reportedAt}</span>
              </div>
              <h4 className="text-sm font-semibold text-white">{inc.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{inc.description}</p>
              <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 pt-1">
                <span>Affected Node: <button onClick={() => setSelectedMachineId(inc.workstationId)} className="text-emerald-400 hover:underline">{inc.workstationId}</button></span>
                <span>•</span>
                <span>Lab: {inc.labId}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-center">
              {inc.status !== 'resolved' ? (
                <button
                  onClick={() => resolveIncident(inc.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <div className="text-right">
                  <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RESOLVED</span>
                  </span>
                  {inc.resolvedAt && (
                    <span className="block text-[10px] text-slate-500 font-mono">at {inc.resolvedAt}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Infrastructure Incident</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Target Workstation</label>
                <select
                  value={targetWsId}
                  onChange={(e) => setTargetWsId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  {workstations.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.id} — {ws.labName.split(' ')[0]} ({ws.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Incident Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., GPU Fan Bearing Rattle / Severe Throttling"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="low">Low — Minor cosmetic or non-blocking anomaly</option>
                  <option value="medium">Medium — Degraded performance</option>
                  <option value="high">High — Workstation unstable / rebooting</option>
                  <option value="critical">Critical — Complete hardware fault / unusable</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Diagnostic Details</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Include error codes, symptoms, or observed kernel logs..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

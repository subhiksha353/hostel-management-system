import React, { useState } from 'react';
import { INITIAL_AUDIT_LOGS } from '../../services/supabase/mockData';
import { Card } from '../../components/ui/Card';
import { History, ShieldCheck, Lock, Search } from 'lucide-react';
import { formatDateFull } from '../../lib/utils';

export const AuditLogs: React.FC = () => {
  const [logs] = useState(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_id.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Administrative Security Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable system log of administrative status transitions, priority updates, and department assignments
        </p>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero-Leakage Audit Integrity:</strong> Audit records capture administrative actions without recording student identities.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
          RLS Verified
        </span>
      </div>

      <Card className="p-4 sm:p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, tracking ID, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Record ID</th>
                <th className="py-3 px-4">Actor Persona</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateFull(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.action}</td>
                  <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">{log.entity_id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold uppercase px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

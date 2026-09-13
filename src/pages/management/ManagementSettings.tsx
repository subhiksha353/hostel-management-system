import React, { useState } from 'react';
import { MOCK_DEPARTMENTS } from '../../services/supabase/mockData';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Settings,
  Building,
  Sparkles,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Database,
} from 'lucide-react';

export const ManagementSettings: React.FC = () => {
  const { showToast } = useToast();
  const [departments] = useState(MOCK_DEPARTMENTS);
  const [aiProvider, setAiProvider] = useState('heuristic');
  const [autoRoutingEnabled, setAutoRoutingEnabled] = useState(true);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);

  const handleSave = () => {
    showToast('Settings Saved', 'System configurations updated successfully.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          Campus Configuration & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          System routing parameters, AI diagnostics provider, and institutional preferences
        </p>
      </div>

      {/* AI Diagnostic Configuration */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Intelligence Provider</h3>
            <p className="text-xs text-slate-500">
              Configure NLP engine for duplicate detection, auto-categorization, and summarization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'heuristic', name: 'Built-in Heuristics Engine', badge: 'Active (Zero Setup)' },
            { id: 'gemini', name: 'Google Gemini 2.0 API', badge: 'Configurable' },
            { id: 'openai', name: 'OpenAI GPT-4o API', badge: 'Configurable' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setAiProvider(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                aiProvider === p.id
                  ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{p.name}</div>
              <span className="text-[10px] text-purple-700 font-medium block mt-1">{p.badge}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Automated Department Routing */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Campus Departments</h3>
              <p className="text-xs text-slate-500">Official bodies mapped to incoming student ticket categories</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {departments.map((d) => (
            <div key={d.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{d.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{d.contact_email}</p>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {d.code}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" size="md" onClick={handleSave} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
          Save System Preferences
        </Button>
      </div>
    </div>
  );
};

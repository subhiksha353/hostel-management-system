import React from 'react';
import { Card } from '../../components/ui/Card';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  CheckCircle2,
  Database,
  KeyRound,
  FileText,
  AlertTriangle,
  Server,
  HelpCircle,
} from 'lucide-react';

export const PrivacyCenter: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-3xl bg-navy-950 text-white p-6 sm:p-8 space-y-4 shadow-xl border border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              Zero-Knowledge Identity Vault
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">CampusVoice Privacy Center</h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          CampusVoice is built on the principle that honest student feedback and reporting require guaranteed freedom from retaliation or personal identification. Here is how our architecture guarantees your privacy.
        </p>
      </div>

      {/* Comparison Grid: What Management Can vs Cannot See */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visible Column */}
        <Card className="p-6 bg-white border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>What Management CAN See</span>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Random Anonymous Pseudonym</strong> (e.g. <code>Anonymous Student #A7F29</code>)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Problem Description & Category</strong> provided in your submission</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Location details</strong> (Hostel block, room, or campus landmark)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Attached evidence files</strong> (Photos, videos, or recorded voice notes)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Two-way encrypted chat messages</strong> transmitted in that ticket</span>
            </li>
          </ul>
        </Card>

        {/* Hidden Column */}
        <Card className="p-6 bg-white border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm uppercase tracking-wider">
            <EyeOff className="w-5 h-5 text-rose-600" />
            <span>What Management CANNOT See</span>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Your Real Student Name</strong> or personal profile</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Student Roll / Register Number</strong></span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Personal or Institutional Email Address</strong></span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>Phone number or IP Address logs</strong></span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span><strong>The internal <code>complaint_identity_map</code> database table</strong></span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Technical RLS Architecture Explained */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200/80 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Architectural Separation of Identity
            </h3>
            <p className="text-xs text-slate-500">
              How PostgreSQL Row Level Security (RLS) protects your anonymity at the database kernel level
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 overflow-x-auto">
          <p className="text-blue-400 font-semibold">// PostgreSQL RLS Security Policy Enforcement</p>
          <p className="text-emerald-400">CREATE POLICY "Students can view only their own mapping"</p>
          <p className="pl-4">ON complaint_identity_map FOR SELECT USING (auth.uid() = student_id);</p>
          <p className="text-slate-400">// Wardens and Management roles have ZERO SELECT permissions on identity tables</p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Unlike platforms that merely mask names in frontend Javascript, CampusVoice decouples identity records into an isolated table. Even if a warden or staff member intercepts API network calls or uses internal database querying interfaces, the PostgreSQL engine returns 0 identity mapping rows.
        </p>
      </Card>

      {/* FAQ & Policy Transparency */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Frequently Asked Privacy Questions
        </h3>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-sm text-slate-900">
              Can hostel wardens deduce my identity from room numbers?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When reporting general corridor, bathroom, mess, or Wi-Fi faults, you only need to specify the floor or block (e.g. "Block B 2nd floor"). If reporting an issue inside your private room (e.g. ceiling leak in 312), the location will be visible so maintenance can physically access the room for repairs, but your name remains hidden.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-sm text-slate-900">
              Are upvotes on complaints anonymous?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes. Upvotes use a cryptographically salted one-way hash (SHA-256) per student. This guarantees you cannot vote more than once on an issue while preventing anyone from determining which specific students supported it.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-sm text-slate-900">
              When is emergency identification legally permitted?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In cases involving active life-threatening physical danger, severe violence, or formal police investigations with statutory court orders, institutional emergency protocols may be triggered through super-administrative multi-party verification. Regular management users can never perform identity lookups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

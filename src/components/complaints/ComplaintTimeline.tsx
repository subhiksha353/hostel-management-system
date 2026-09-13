import React from 'react';
import { ComplaintStatus } from '../../types/database';
import { CheckCircle2, Clock, Send, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { formatDateFull } from '../../lib/utils';

export interface ComplaintTimelineProps {
  currentStatus: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({
  currentStatus,
  createdAt,
  resolvedAt,
  resolutionNotes,
}) => {
  const steps: { key: ComplaintStatus; label: string; desc: string; icon: any }[] = [
    {
      key: 'submitted',
      label: 'Submitted',
      desc: 'Grievance submitted anonymously into the secure campus queue.',
      icon: Send,
    },
    {
      key: 'acknowledged',
      label: 'Acknowledged',
      desc: 'Administration acknowledged and verified grievance priority.',
      icon: Clock,
    },
    {
      key: 'assigned',
      label: 'Department Assigned',
      desc: 'Assigned to the responsible department for on-ground action.',
      icon: Sparkles,
    },
    {
      key: 'investigating',
      label: 'Under Investigation',
      desc: 'Inspection and field diagnosis actively underway.',
      icon: RefreshCw,
    },
    {
      key: 'action_taken',
      label: 'Action Taken',
      desc: 'Repairs or remedial measures executed on site.',
      icon: ShieldAlert,
    },
    {
      key: 'resolved',
      label: 'Resolved & Verified',
      desc: resolutionNotes || 'Issue addressed and resolved by administration.',
      icon: CheckCircle2,
    },
  ];

  const statusOrder = [
    'submitted',
    'acknowledged',
    'assigned',
    'investigating',
    'waiting_for_info',
    'action_taken',
    'resolved',
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="py-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const isDone = currentIndex >= idx || currentStatus === 'resolved' || currentStatus === 'closed';
          const isCurrent = currentStatus === step.key;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative group">
              {/* Step indicator node */}
              <div
                className={`absolute -left-6 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div className="ml-2">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {idx === 0 && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateFull(createdAt)}
                    </span>
                  )}
                  {step.key === 'resolved' && resolvedAt && (
                    <span className="text-[11px] text-emerald-600 font-mono font-semibold">
                      {formatDateFull(resolvedAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

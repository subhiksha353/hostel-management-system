import React from 'react';
import { Complaint } from '../../types/database';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { ShieldCheck, ArrowRight, ThumbsUp, AlertCircle, Sparkles } from 'lucide-react';
import { formatDateRelative } from '../../lib/utils';
import { Link } from 'react-router-dom';

export interface ComplaintTableProps {
  complaints: Complaint[];
  baseLink?: string;
  onStatusQuickChange?: (id: string, newStatus: any) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  baseLink = '/management/complaints',
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Tracking ID</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Title & Details</th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4">Priority</th>
            <th className="py-3.5 px-4">Anonymous Student ID</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Department</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {complaints.map((c) => (
            <tr
              key={c.id}
              className={`hover:bg-slate-50/80 transition-colors ${
                c.is_emergency || c.priority === 'critical' ? 'bg-rose-50/30' : ''
              }`}
            >
              {/* Tracking ID */}
              <td className="py-4 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  {(c.is_emergency || c.priority === 'critical') && (
                    <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                  )}
                  <span>{c.public_tracking_id}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  {formatDateRelative(c.created_at)}
                </div>
              </td>

              {/* Category */}
              <td className="py-4 px-4 whitespace-nowrap">
                <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {c.category}
                </span>
              </td>

              {/* Title & Preview */}
              <td className="py-4 px-4 max-w-xs">
                <Link
                  to={`${baseLink}/${c.id}`}
                  className="font-bold text-slate-900 hover:text-blue-600 block line-clamp-1 transition-colors"
                >
                  {c.title}
                </Link>
                <p className="text-slate-500 line-clamp-1 mt-0.5 text-[11px]">{c.description}</p>
                {c.ai_summary && (
                  <div className="flex items-center gap-1 text-[10px] text-purple-700 font-medium mt-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span className="truncate">AI: {c.ai_summary}</span>
                  </div>
                )}
              </td>

              {/* Location */}
              <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
                {c.location}
              </td>

              {/* Priority */}
              <td className="py-4 px-4 whitespace-nowrap">
                <PriorityBadge priority={c.priority} size="sm" />
              </td>

              {/* Anonymous Student ID (Never Real Name) */}
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{c.anonymous_public_id}</span>
                </div>
              </td>

              {/* Status */}
              <td className="py-4 px-4 whitespace-nowrap">
                <StatusBadge status={c.status} size="sm" />
              </td>

              {/* Assigned Department */}
              <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
                {c.assigned_department?.name || 'Unassigned'}
              </td>

              {/* Action */}
              <td className="py-4 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-slate-400" />
                    {c.upvote_count || 0}
                  </span>
                  <Link
                    to={`${baseLink}/${c.id}`}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Open Grievance Workspace"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

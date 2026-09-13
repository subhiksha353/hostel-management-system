import React from 'react';
import { Complaint } from '../../types/database';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { MapPin, MessageSquare, ThumbsUp, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { formatDateRelative } from '../../lib/utils';
import { Link } from 'react-router-dom';

export interface ComplaintCardProps {
  complaint: Complaint;
  onUpvote?: (id: string) => void;
  baseLink?: string;
  showUpvoteButton?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onUpvote,
  baseLink = '/student/complaints',
  showUpvoteButton = true,
}) => {
  return (
    <Card
      hoverEffect
      className={`relative flex flex-col justify-between overflow-hidden border ${
        complaint.is_emergency || complaint.priority === 'critical'
          ? 'border-rose-300 bg-rose-50/20'
          : 'border-slate-200/80 bg-white'
      }`}
    >
      {/* Emergency Ribbon */}
      {(complaint.is_emergency || complaint.priority === 'critical') && (
        <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <AlertCircle className="w-3 h-3" /> Critical
        </div>
      )}

      <div>
        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-16">
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
            {complaint.public_tracking_id}
          </span>
          <StatusBadge status={complaint.status} size="sm" />
          <PriorityBadge priority={complaint.priority} size="sm" />
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {complaint.category}
          </span>
        </div>

        {/* Title */}
        <Link to={`${baseLink}/${complaint.id}`} className="block group">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {complaint.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* AI summary badge if present */}
        {complaint.ai_summary && (
          <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2 text-[11px] text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
            <span className="line-clamp-1 italic">{complaint.ai_summary}</span>
          </div>
        )}

        {/* Location & Anonymous identity info */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px]">{complaint.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{complaint.anonymous_public_id}</span>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/80">
        <span className="text-[11px] text-slate-400 font-medium">
          {formatDateRelative(complaint.created_at)}
        </span>

        <div className="flex items-center gap-2">
          {showUpvoteButton && onUpvote && (
            <button
              type="button"
              onClick={() => onUpvote(complaint.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                complaint.has_user_upvoted
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Support this issue"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${complaint.has_user_upvoted ? 'fill-current' : ''}`} />
              <span>{complaint.upvote_count || 0}</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded-lg">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{complaint.messages?.length || 0}</span>
          </div>

          <Link
            to={`${baseLink}/${complaint.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

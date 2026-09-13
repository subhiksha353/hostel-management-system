import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SimilarComplaintResult } from '../../types/complaint';
import { Sparkles, ThumbsUp, ArrowRight, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export interface SimilarIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  similarIssues: SimilarComplaintResult[];
  onSupportExisting: (issueId: string) => void;
  onSubmitAnyway: () => void;
}

export const SimilarIssuesModal: React.FC<SimilarIssuesModalProps> = ({
  isOpen,
  onClose,
  similarIssues,
  onSupportExisting,
  onSubmitAnyway,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2 text-blue-700">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Similar Existing Issues Found</span>
        </div>
      }
      description="Other students have already reported an issue similar to yours. Upvoting existing reports accelerates administrative resolution!"
    >
      <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
        {similarIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/80 transition-all space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {issue.public_tracking_id}
              </span>
              <StatusBadge status={issue.status} size="sm" />
            </div>

            <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-2">{issue.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-xs">
              <span className="text-blue-800 font-semibold flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                {issue.upvote_count} students affected
              </span>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onSupportExisting(issue.id)}
                leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
              >
                Support This Issue
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
        >
          Review My Form
        </button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSubmitAnyway}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Submit As New Issue Anyway
        </Button>
      </div>
    </Modal>
  );
};

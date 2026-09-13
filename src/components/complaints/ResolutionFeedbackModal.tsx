import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';

export interface ResolutionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintTitle: string;
  trackingId: string;
  onSubmitFeedback: (isResolved: boolean, rating: number, comments: string) => Promise<void>;
}

export const ResolutionFeedbackModal: React.FC<ResolutionFeedbackModalProps> = ({
  isOpen,
  onClose,
  complaintTitle,
  trackingId,
  onSubmitFeedback,
}) => {
  const [isResolved, setIsResolved] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResolved === null) return;
    setIsSubmitting(true);
    try {
      await onSubmitFeedback(isResolved, rating, comments);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Resolution Verification"
      description={`Management has marked grievance ${trackingId} as resolved.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5 mt-2">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium">
          "{complaintTitle}"
        </div>

        {/* Question 1: Was it actually resolved? */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Was your issue actually resolved on the ground?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsResolved(true)}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-bold text-sm transition-all ${
                isResolved === true
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              <span>Yes, Resolved 👍</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResolved(false)}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-bold text-sm transition-all ${
                isResolved === false
                  ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ThumbsDown className="w-5 h-5 text-rose-600" />
              <span>No, Not Fixed 👎</span>
            </button>
          </div>

          {isResolved === false && (
            <p className="text-xs text-rose-600 mt-2 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              ⚠️ Selecting "No" will automatically reopen the grievance and alert the administration team for immediate re-inspection.
            </p>
          )}
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Rating of resolution response & quality
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-600 ml-2 font-mono">
              {rating}/5 Stars
            </span>
          </div>
        </div>

        {/* Optional Comments */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Optional Feedback / Remarks
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share any details on the repair quality or speed..."
            rows={3}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isResolved === null}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { Suggestion, SuggestionStatus } from '../../types/database';
import { suggestionService } from '../../services/supabase/suggestionService';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Lightbulb,
  ThumbsUp,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { formatDateRelative } from '../../lib/utils';

export const ManagementSuggestions: React.FC = () => {
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status Action Modal
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [targetStatus, setTargetStatus] = useState<SuggestionStatus>('approved');
  const [officialResponse, setOfficialResponse] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const list = await suggestionService.getSuggestions();
      setSuggestions(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const openActionModal = (s: Suggestion, status: SuggestionStatus) => {
    setSelectedSuggestion(s);
    setTargetStatus(status);
    setOfficialResponse(s.official_response || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestion) return;

    setIsUpdating(true);
    try {
      await suggestionService.updateStatus(selectedSuggestion.id, targetStatus, officialResponse);
      setSuggestions((prev) =>
        prev.map((item) =>
          item.id === selectedSuggestion.id
            ? { ...item, status: targetStatus, official_response: officialResponse }
            : item
        )
      );
      setSelectedSuggestion(null);
      showToast('Suggestion Updated', `Status changed to ${targetStatus.toUpperCase()}.`, 'success');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          Student Campus Proposals & Ideas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review upvoted student ideas, approve feasibility, and publish administrative commitments
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState
          title="No suggestions submitted yet"
          description="Student suggestions will appear here sorted by student upvote count."
        />
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <Card key={s.id} className="p-6 bg-white border-slate-200/80 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {s.category}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-blue-200">
                    <ThumbsUp className="w-3.5 h-3.5" /> {s.upvote_count} Upvotes
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {s.anonymous_public_id}
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {formatDateRelative(s.created_at)}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{s.description}</p>
              </div>

              {s.official_response && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                  <strong className="text-blue-900 block font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Current Administration Response:
                  </strong>
                  <p>{s.official_response}</p>
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 capitalize">
                  Current Status: <strong className="text-slate-800">{s.status.replace('_', ' ')}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(s, 'approved')}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(s, 'implemented')}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Mark Implemented
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(s, 'rejected')}
                    leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedSuggestion && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSuggestion(null)}
          title={`Update Proposal: ${targetStatus.toUpperCase()}`}
          description={`Update administrative status and attach official remarks for "${selectedSuggestion.title}".`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Response / Commitment *
              </label>
              <textarea
                required
                rows={4}
                value={officialResponse}
                onChange={(e) => setOfficialResponse(e.target.value)}
                placeholder="Explain the approval decision, implementation timeline, or reason if declined..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSuggestion(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Save Decision & Publish
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

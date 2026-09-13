import React, { useState, useEffect } from 'react';
import { Suggestion } from '../../types/database';
import { suggestionService } from '../../services/supabase/suggestionService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { COMPLAINT_CATEGORIES } from '../../lib/constants';
import {
  Lightbulb,
  ThumbsUp,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatDateRelative } from '../../lib/utils';

export const SuggestionsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Suggestion Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hostel');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await suggestionService.getSuggestions();
      setSuggestions(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleUpvote = async (id: string) => {
    const res = await suggestionService.upvoteSuggestion(id, user?.id || 'demo-user');
    if (res.success) {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, upvote_count: res.newCount, has_user_upvoted: !s.has_user_upvoted } : s))
      );
      showToast('Support Recorded', 'Your upvote has been registered.', 'success');
    }
  };

  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await suggestionService.createSuggestion(title, description, category);
      setSuggestions((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      showToast('Idea Submitted', 'Your campus improvement suggestion was submitted anonymously.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Approved & Planned</span>;
      case 'implemented':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Implemented 🎉</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Under Review</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Not Feasible</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Open for Votes</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            Student Campus Suggestions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Propose institutional improvements and vote on ideas for hostel and campus life
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Propose an Idea
        </Button>
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState
          title="No campus suggestions yet"
          description="Be the first to submit a suggestion to enhance campus life."
          actionLabel="Propose an Idea"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((s) => (
            <Card key={s.id} hoverEffect className="p-6 bg-white border-slate-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {s.category}
                  </span>
                  {getStatusBadge(s.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.description}</p>

                {/* Official Management Response if available */}
                {s.official_response && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                    <span className="font-bold text-blue-900 block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Administration Response:
                    </span>
                    <p className="leading-relaxed">{s.official_response}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatDateRelative(s.created_at)}
                </span>

                <button
                  type="button"
                  onClick={() => handleUpvote(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                    s.has_user_upvoted
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${s.has_user_upvoted ? 'fill-current' : ''}`} />
                  <span>{s.upvote_count || 0} Upvotes</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Suggestion Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Propose Campus Improvement"
        description="Share constructive suggestions for infrastructure, dining, academics, or hostel life."
      >
        <form onSubmit={handleCreateSuggestion} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
            >
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title of Suggestion *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Install water purifiers on upper hostel floors"
              className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Proposal & Student Impact *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how this improves student well-being, estimated usage, and practical benefits..."
              className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Submit Suggestion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

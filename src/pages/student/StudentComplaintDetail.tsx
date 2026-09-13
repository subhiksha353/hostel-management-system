import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Complaint, ComplaintMessage } from '../../types/database';
import { complaintService } from '../../services/supabase/complaintService';
import { messageService } from '../../services/supabase/messageService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { MessageThread } from '../../components/chat/MessageThread';
import { AudioPlayer } from '../../components/media/AudioPlayer';
import { ImagePreview } from '../../components/media/ImagePreview';
import { VideoPreview } from '../../components/media/VideoPreview';
import { ResolutionFeedbackModal } from '../../components/complaints/ResolutionFeedbackModal';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  ThumbsUp,
  Star,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { formatDateFull } from '../../lib/utils';

export const StudentComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const c = await complaintService.getComplaintById(id);
      if (c) {
        setComplaint(c);
        const msgs = await messageService.getMessages(c.id);
        setMessages(msgs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime messages
    if (id) {
      const unsubscribe = messageService.subscribeToMessages(id, (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        showToast('New Message Received', `${newMsg.sender_display_name} sent an update.`, 'info');
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleSendMessage = async (text: string) => {
    if (!complaint) return;
    const newMsg = await messageService.sendMessage(
      complaint.id,
      text,
      'student',
      complaint.anonymous_public_id
    );
    setMessages((prev) => [...prev, newMsg]);
    showToast('Message Transmitted', 'Delivered anonymously to assigned administration.', 'success');
  };

  const handleUpvote = async () => {
    if (!complaint) return;
    const res = await complaintService.upvoteComplaint(complaint.id, user?.id || 'demo-student');
    if (res.success) {
      setComplaint({
        ...complaint,
        upvote_count: res.newCount,
        has_user_upvoted: !complaint.has_user_upvoted,
      });
    }
  };

  const handleFeedbackSubmit = async (isResolved: boolean, rating: number, comments: string) => {
    if (!complaint) return;
    await complaintService.submitFeedback(complaint.id, isResolved, rating, comments);
    showToast(
      isResolved ? 'Thank You for Verifying' : 'Issue Reopened for Re-Inspection',
      isResolved ? 'Your feedback was logged.' : 'Maintenance team notified of remaining issue.',
      isResolved ? 'success' : 'warning'
    );
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Grievance Not Found</h3>
        <p className="text-xs text-slate-500">The requested tracking record could not be loaded.</p>
        <Link to="/student/dashboard">
          <Button variant="primary" size="sm">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/my-reports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUpvote}
            leftIcon={<ThumbsUp className={`w-3.5 h-3.5 ${complaint.has_user_upvoted ? 'fill-current text-blue-600' : ''}`} />}
          >
            Support ({complaint.upvote_count || 0})
          </Button>

          {complaint.status === 'resolved' && (
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => setIsFeedbackModalOpen(true)}
              leftIcon={<Star className="w-3.5 h-3.5" />}
            >
              Verify Resolution
            </Button>
          )}
        </div>
      </div>

      {/* Main Grievance Header Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {complaint.public_tracking_id}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{complaint.anonymous_public_id}</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {complaint.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* AI Summary Banner */}
        {complaint.ai_summary && (
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-purple-900">AI Diagnostic Summary:</strong>
              <span>{complaint.ai_summary}</span>
            </div>
          </div>
        )}

        {/* Location & Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-800">{complaint.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Submitted: {formatDateFull(complaint.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Assigned: {complaint.assigned_department?.name || 'Department Routing'}</span>
          </div>
        </div>
      </Card>

      {/* Attachments Section if present */}
      {complaint.attachments && complaint.attachments.length > 0 && (
        <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Attached Evidence ({complaint.attachments.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {complaint.attachments.map((att) => (
              <div key={att.id}>
                {att.file_type === 'image' && (
                  <ImagePreview src={att.file_url} fileName={att.file_name} />
                )}
                {att.file_type === 'video' && (
                  <VideoPreview src={att.file_url} fileName={att.file_name} />
                )}
                {att.file_type === 'audio' && (
                  <AudioPlayer src={att.file_url} fileName={att.file_name} />
                )}
                {att.file_type === 'document' && (
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800"
                  >
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span className="truncate">{att.file_name}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grid: Timeline & Realtime Two-Way Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Timeline (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Grievance Timeline
            </h3>
            <ComplaintTimeline
              currentStatus={complaint.status}
              createdAt={complaint.created_at}
              resolvedAt={complaint.resolved_at}
              resolutionNotes={complaint.resolution_notes}
            />
          </Card>
        </div>

        {/* Right: Two-way Chat (3 cols) */}
        <div className="lg:col-span-3">
          <MessageThread
            messages={messages}
            currentUserRole={role}
            anonymousPublicId={complaint.anonymous_public_id}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Feedback Verification Modal */}
      <ResolutionFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        complaintTitle={complaint.title}
        trackingId={complaint.public_tracking_id}
        onSubmitFeedback={handleFeedbackSubmit}
      />
    </div>
  );
};

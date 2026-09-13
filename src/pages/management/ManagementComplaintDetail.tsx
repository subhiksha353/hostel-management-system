import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Complaint, ComplaintMessage, ComplaintStatus, ComplaintPriority, Department } from '../../types/database';
import { complaintService } from '../../services/supabase/complaintService';
import { messageService } from '../../services/supabase/messageService';
import { MOCK_DEPARTMENTS } from '../../services/supabase/mockData';
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
import { Modal } from '../../components/ui/Modal';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../lib/constants';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  ThumbsUp,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
} from 'lucide-react';
import { formatDateFull } from '../../lib/utils';

export const ManagementComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [isLoading, setIsLoading] = useState(true);

  // Status Action modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

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

    if (id) {
      const unsubscribe = messageService.subscribeToMessages(id, (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    if (!complaint) return;
    setIsActionLoading(true);
    try {
      await complaintService.updateComplaintStatus(complaint.id, newStatus, role);
      setComplaint({ ...complaint, status: newStatus });
      showToast('Status Updated', `Grievance status updated to "${STATUS_LABELS[newStatus]?.label}".`, 'success');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: ComplaintPriority) => {
    if (!complaint) return;
    await complaintService.updateComplaintPriority(complaint.id, newPriority);
    setComplaint({ ...complaint, priority: newPriority });
    showToast('Priority Updated', `Priority set to ${newPriority.toUpperCase()}.`, 'info');
  };

  const handleDepartmentChange = async (deptId: string) => {
    if (!complaint) return;
    await complaintService.assignDepartment(complaint.id, deptId);
    const dept = departments.find((d) => d.id === deptId);
    setComplaint({ ...complaint, assigned_department_id: deptId, assigned_department: dept, status: 'assigned' });
    showToast('Department Assigned', `Routing assigned to ${dept?.name || 'Department'}.`, 'success');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setIsActionLoading(true);
    try {
      await complaintService.updateComplaintStatus(complaint.id, 'resolved', role, resolutionNotes);
      setComplaint({
        ...complaint,
        status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
      });
      setIsResolveModalOpen(false);
      showToast('Issue Marked Resolved', 'Student will receive resolution verification notification.', 'success');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!complaint) return;
    const senderDisplay = role === 'warden' ? 'Hostel Warden Office' : 'Campus Administration';
    const newMsg = await messageService.sendMessage(complaint.id, text, role, senderDisplay);
    setMessages((prev) => [...prev, newMsg]);
    showToast('Reply Sent', 'Student will receive your response securely.', 'success');
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
        <h3 className="text-lg font-bold text-slate-800">Record Not Found</h3>
        <Link to="/management/complaints">
          <Button variant="primary" size="sm">
            Back to Grievance Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/management/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Triage Queue
        </Link>

        {/* Quick Lifecycle Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {complaint.status === 'submitted' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleStatusChange('acknowledged')}
              isLoading={isActionLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-blue-600" />}
            >
              Acknowledge Grievance
            </Button>
          )}

          {complaint.status !== 'investigating' && complaint.status !== 'resolved' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('investigating')}
              isLoading={isActionLoading}
              leftIcon={<RefreshCw className="w-4 h-4 text-amber-600" />}
            >
              Mark Under Investigation
            </Button>
          )}

          {complaint.status !== 'action_taken' && complaint.status !== 'resolved' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('action_taken')}
              isLoading={isActionLoading}
              leftIcon={<Send className="w-4 h-4 text-cyan-600" />}
            >
              Mark Action Taken
            </Button>
          )}

          {complaint.status !== 'resolved' && (
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => setIsResolveModalOpen(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark Resolved
            </Button>
          )}

          {complaint.status === 'resolved' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('reopened')}
              isLoading={isActionLoading}
              leftIcon={<RefreshCw className="w-4 h-4 text-rose-600" />}
            >
              Reopen Grievance
            </Button>
          )}
        </div>
      </div>

      {/* Main Details & Management Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8 bg-white border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {complaint.public_tracking_id}
                </span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {complaint.category}
                </span>
              </div>

              {/* Crucial Privacy Guarantee: Strictly Anonymous Pseudonym */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{complaint.anonymous_public_id}</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {complaint.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* AI Diagnostics Banner */}
            {complaint.ai_summary && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" /> AI Executive Summary:
                  </span>
                  {complaint.ai_confidence && (
                    <span className="font-mono text-[11px] font-bold text-purple-700">
                      Confidence: {complaint.ai_confidence}%
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">{complaint.ai_summary}</p>
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
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">{complaint.upvote_count || 0} Affected Students</span>
              </div>
            </div>
          </Card>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Submitted Evidence Files ({complaint.attachments.length})
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

          {/* Two-way Anonymous Chat */}
          <MessageThread
            messages={messages}
            currentUserRole={role}
            anonymousPublicId={complaint.anonymous_public_id}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Right Column: Administrative Controls & Timeline (1 col) */}
        <div className="space-y-6">
          {/* Controls Card */}
          <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Administrative Routing & Controls
            </h3>

            {/* Change Assigned Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Department
              </label>
              <select
                value={complaint.assigned_department_id || ''}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Change Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Grievance Priority
              </label>
              <select
                value={complaint.priority}
                onChange={(e) => handlePriorityChange(e.target.value as ComplaintPriority)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">🚨 Critical / Emergency</option>
              </select>
            </div>

            {/* Change Lifecycle Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lifecycle Status
              </label>
              <select
                value={complaint.status}
                onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submitted">Submitted</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="assigned">Assigned</option>
                <option value="investigating">Under Investigation</option>
                <option value="waiting_for_info">Waiting for Info</option>
                <option value="action_taken">Action Taken</option>
                <option value="resolved">Resolved</option>
                <option value="reopened">Reopened</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Admin Delete Action */}
            {(role === 'admin' || role === 'super_admin') && (
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    if (window.confirm('Delete this complaint permanently as fake/spam?')) {
                      await complaintService.deleteFakeComplaint(complaint.id);
                      showToast('Complaint Deleted', 'Fake complaint removed by administrator.', 'success');
                      window.history.back();
                    }
                  }}
                  className="w-full text-xs"
                >
                  🗑️ Delete as Fake / Spam Report
                </Button>
              </div>
            )}

            {/* Privacy Architecture Notice */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
              <strong className="font-bold flex items-center gap-1 text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Identity Protected
              </strong>
              <p>
                Student personal details (Name, Email, Roll No) are quarantined. Communicating through this portal preserves institutional trust.
              </p>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Resolution Timeline
            </h3>
            <ComplaintTimeline
              currentStatus={complaint.status}
              createdAt={complaint.created_at}
              resolvedAt={complaint.resolved_at}
              resolutionNotes={complaint.resolution_notes}
            />
          </Card>
        </div>
      </div>

      {/* Resolution Notes Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Complete & Resolve Grievance"
        description="Detail the repair actions or corrective measures taken before closing."
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Resolution Summary & Actions Taken *
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Overhead pipe leak replaced and sealed by plumbing maintenance crew. Ceiling dry."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" size="sm" isLoading={isActionLoading}>
              Confirm Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

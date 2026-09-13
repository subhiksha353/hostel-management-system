import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, Announcement } from '../../types/database';
import { complaintService } from '../../services/supabase/complaintService';
import { announcementService } from '../../services/supabase/announcementService';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { EmergencyAlertBanner } from '../../components/complaints/EmergencyAlertBanner';
import { PrivacyBadge } from '../../components/common/PrivacyBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  PlusCircle,
  Lightbulb,
  Flame,
  FileText,
  MessageSquare,
  Megaphone,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Building,
  Calendar,
  UtensilsCrossed,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateRelative } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allComplaints, allAnnouncements] = await Promise.all([
        complaintService.getComplaints(),
        announcementService.getAnnouncements(),
      ]);
      setComplaints(allComplaints);
      setAnnouncements(allAnnouncements.slice(0, 2));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpvote = async (id: string) => {
    const res = await complaintService.upvoteComplaint(id, user?.id || 'demo-student');
    if (res.success) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, upvote_count: res.newCount, has_user_upvoted: !c.has_user_upvoted } : c))
      );
      showToast('Support Recorded', 'Your anonymous upvote has been registered to prioritize this issue.', 'success');
    }
  };

  const totalCount = complaints.length;
  const openCount = complaints.filter(
    (c) => c.status === 'submitted' || c.status === 'acknowledged' || c.status === 'assigned'
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'investigating' || c.status === 'action_taken' || c.status === 'waiting_for_info'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Header matching Reference UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Hello, {user?.profile.name || 'Sowmiya'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back to your hostel! • {user?.profile.hostel_block || 'Block A'} (Room {user?.profile.room_number || '312'})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrivacyBadge linkToCenter />
          <Link to="/student/create">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Raise Complaint
            </Button>
          </Link>
        </div>
      </div>

      {/* Institution Info Card matching Reference UI */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-navy-950 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-300 shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Campus & Hostel Management Hub</h3>
            <p className="text-xs text-blue-200">HostelConnect Suite • Safe Stay • Better Tomorrow</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          Verified Student Portal
        </span>
      </div>

      {/* 3 Prominent Feature Cards matching Reference UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Complaint Box */}
        <Link
          to="/student/create"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 hover:border-amber-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Complaint Box</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Raise an anonymous complaint, track status & updates.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* 2. Leave Form */}
        <Link
          to="/student/leave/apply"
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Leave Form</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Apply for leave to go home or outside the hostel.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* 3. Food Count */}
        <Link
          to="/student/food-count"
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Food Count</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                Mark your daily hostel presence for mess headcount.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Emergency Alert Banner */}
      <EmergencyAlertBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="All Reports"
          value={totalCount}
          subtitle="Grievances registered"
          icon={<FileText className="w-6 h-6" />}
          variant="blue"
        />
        <StatsCard
          title="Open Issues"
          value={openCount}
          subtitle="Pending acknowledgement"
          icon={<Clock className="w-6 h-6" />}
          variant="default"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Field investigation & repair"
          icon={<TrendingUp className="w-6 h-6" />}
          variant="purple"
        />
        <StatsCard
          title="Resolved"
          value={resolvedCount}
          subtitle={`${Math.round((resolvedCount / Math.max(1, totalCount)) * 100)}% resolution rate`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Announcements Carousel / Cards */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-600" />
              Latest Campus Administration Announcements
            </h3>
            <Link to="/student/announcements" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {announcements.map((a) => (
              <Card key={a.id} className="p-4 sm:p-5 bg-gradient-to-br from-purple-50/40 via-white to-white border-purple-200/80">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {a.department_name || 'Campus Wide'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDateRelative(a.created_at)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{a.content}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Grievance Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Campus Grievance Feed</h3>
            <p className="text-xs text-slate-500">
              Support ongoing issues to raise their priority or monitor real-time maintenance progress
            </p>
          </div>
          <Link to="/student/my-reports" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View My Submitted Reports Only →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No grievances reported yet"
            description="All systems appear operational across campus and hostels."
            actionLabel="Report a Grievance"
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onUpvote={handleUpvote}
                baseLink="/student/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, Department } from '../../types/database';
import {
  AnalyticsSummary,
  CategoryDistribution,
  MonthlyTrend,
  PriorityBreakdown,
  HostelBlockHeatmapData,
} from '../../types/analytics';
import { complaintService } from '../../services/supabase/complaintService';
import { analyticsService } from '../../services/supabase/analyticsService';
import { StatsCard } from '../../components/analytics/StatsCard';
import { MonthlyTrendsChart, CategoryBarChart, PriorityPieChart } from '../../components/analytics/AnalyticsCharts';
import { CampusHeatmap } from '../../components/analytics/CampusHeatmap';
import { ComplaintTable } from '../../components/complaints/ComplaintTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ROLE_LABELS } from '../../lib/constants';
import {
  FileText,
  Clock,
  CheckCircle2,
  Flame,
  TrendingUp,
  Megaphone,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagementDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const roleInfo = ROLE_LABELS[role];

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [priorities, setPriorities] = useState<PriorityBreakdown[]>([]);
  const [heatmap, setHeatmap] = useState<HostelBlockHeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [complaintsData, summaryData, catData, trendData, prioData, heatData] = await Promise.all([
          complaintService.getComplaints(undefined, role),
          analyticsService.getAnalyticsSummary(),
          analyticsService.getCategoryDistribution(),
          analyticsService.getMonthlyTrends(),
          analyticsService.getPriorityBreakdown(),
          analyticsService.getHostelBlockHeatmap(),
        ]);

        setComplaints(complaintsData);
        setSummary(summaryData);
        setCategories(catData);
        setTrends(trendData);
        setPriorities(prioData);
        setHeatmap(heatData);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [role]);

  const criticalIssues = complaints.filter((c) => c.priority === 'critical' || c.is_emergency);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Administrative Control Center 🛡️
            </h1>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${roleInfo.badge}`}>
              {roleInfo.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time grievance triage, department routing, and resolution metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/management/announcements">
            <Button variant="outline" size="sm" leftIcon={<Megaphone className="w-4 h-4" />}>
              Broadcast Notice
            </Button>
          </Link>
          <Link to="/management/complaints">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Triage Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Emergency Queue Alert (if critical items exist) */}
      {criticalIssues.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {criticalIssues.length} Critical / Emergency Grievances Require Immediate Attention
              </h4>
              <p className="text-xs text-rose-100">
                High-priority life safety and infrastructural hazards flagged by students
              </p>
            </div>
          </div>
          <Link to="/management/emergency-queue" className="shrink-0">
            <Button variant="secondary" size="sm" className="bg-white text-rose-700 hover:bg-rose-50">
              View Emergency Queue 🚨
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          title="Total Reports"
          value={summary?.totalComplaints || 0}
          subtitle="All recorded tickets"
          icon={<FileText className="w-5 h-5" />}
          variant="blue"
        />
        <StatsCard
          title="Open / Unassigned"
          value={summary?.openComplaints || 0}
          subtitle="Needs routing"
          icon={<Clock className="w-5 h-5" />}
          variant="default"
        />
        <StatsCard
          title="Critical Issues"
          value={summary?.criticalComplaints || 0}
          subtitle="Urgent priority"
          icon={<Flame className="w-5 h-5" />}
          variant="urgent"
        />
        <StatsCard
          title="In Progress"
          value={summary?.inProgressComplaints || 0}
          subtitle="Field teams active"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="purple"
        />
        <StatsCard
          title="Resolved"
          value={summary?.resolvedComplaints || 0}
          subtitle={`${summary?.resolutionRatePercentage || 0}% rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
        <StatsCard
          title="Avg Turnaround"
          value={`${summary?.averageResolutionHours || 0}h`}
          subtitle="SLA resolution speed"
          icon={<BarChart3 className="w-5 h-5" />}
          variant="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendsChart data={trends} />
        <CategoryBarChart data={categories} />
      </div>

      {/* Problem Heatmap */}
      <CampusHeatmap data={heatmap} />

      {/* Recent Triage Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Recent Grievances for Triage
            </h3>
            <p className="text-xs text-slate-500">
              Anonymized student reports ready for assignment, investigation, and updates
            </p>
          </div>
          <Link to="/management/complaints" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View Full Triage Table →
          </Link>
        </div>

        <ComplaintTable complaints={complaints.slice(0, 5)} baseLink="/management/complaints" />
      </div>
    </div>
  );
};

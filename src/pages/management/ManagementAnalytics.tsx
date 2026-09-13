import React, { useState, useEffect } from 'react';
import {
  AnalyticsSummary,
  CategoryDistribution,
  MonthlyTrend,
  PriorityBreakdown,
  HostelBlockHeatmapData,
  DepartmentPerformance,
} from '../../types/analytics';
import { AIInsightReport } from '../../types/ai';
import { analyticsService } from '../../services/supabase/analyticsService';
import { aiService } from '../../services/ai';
import { StatsCard } from '../../components/analytics/StatsCard';
import {
  MonthlyTrendsChart,
  CategoryBarChart,
  PriorityPieChart,
  DepartmentPerformanceTable,
} from '../../components/analytics/AnalyticsCharts';
import { CampusHeatmap } from '../../components/analytics/CampusHeatmap';
import { Card } from '../../components/ui/Card';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export const ManagementAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [priorities, setPriorities] = useState<PriorityBreakdown[]>([]);
  const [heatmap, setHeatmap] = useState<HostelBlockHeatmapData[]>([]);
  const [deptPerformance, setDeptPerformance] = useState<DepartmentPerformance[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsightReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [sum, cat, tr, prio, heat, dept] = await Promise.all([
          analyticsService.getAnalyticsSummary(),
          analyticsService.getCategoryDistribution(),
          analyticsService.getMonthlyTrends(),
          analyticsService.getPriorityBreakdown(),
          analyticsService.getHostelBlockHeatmap(),
          analyticsService.getDepartmentPerformance(),
        ]);

        setSummary(sum);
        setCategories(cat);
        setTrends(tr);
        setPriorities(prio);
        setHeatmap(heat);
        setDeptPerformance(dept);

        // Generate dynamic AI Insights from data
        const insights = await aiService.generateManagementInsights([]);
        setAiInsights(insights);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Campus Grievance Analytics & Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historical trends, resolution turnaround SLAs, problem heatmaps, and AI intelligence
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Resolution Rate"
          value={`${summary?.resolutionRatePercentage || 0}%`}
          subtitle="Overall institutional efficacy"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
          trend={{ value: '+4.2% vs last month', isPositive: true }}
        />
        <StatsCard
          title="Average SLA Time"
          value={`${summary?.averageResolutionHours || 0}h`}
          subtitle="From submission to fix"
          icon={<Clock className="w-6 h-6" />}
          variant="blue"
          trend={{ value: '-2.1h faster turnaround', isPositive: true }}
        />
        <StatsCard
          title="Active Hotspot Issues"
          value={summary?.inProgressComplaints || 0}
          subtitle="Under field investigation"
          icon={<TrendingUp className="w-6 h-6" />}
          variant="purple"
        />
        <StatsCard
          title="Critical Emergencies"
          value={summary?.criticalComplaints || 0}
          subtitle="High priority incidents"
          icon={<Flame className="w-6 h-6" />}
          variant="urgent"
        />
      </div>

      {/* AI Intelligence Insights Section */}
      <Card className="p-6 sm:p-7 bg-gradient-to-br from-purple-950 via-slate-900 to-navy-950 text-white border-purple-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                AI Management Insights & Trend Warnings
              </h3>
              <p className="text-xs text-purple-200">
                Automated statistical anomaly detection across campus grievance streams
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-900/80 border border-purple-700 text-purple-200 uppercase">
            Live Diagnostics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300">
                  {insight.recommendedDepartment}
                </span>
                {insight.metricChange && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200">
                    {insight.metricChange}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-white text-sm leading-snug">{insight.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.insight}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendsChart data={trends} />
        <CategoryBarChart data={categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityPieChart data={priorities} />
        <DepartmentPerformanceTable data={deptPerformance} />
      </div>

      {/* Problem Heatmap */}
      <CampusHeatmap data={heatmap} />
    </div>
  );
};

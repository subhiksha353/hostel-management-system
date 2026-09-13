export interface AnalyticsSummary {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  criticalComplaints: number;
  averageResolutionHours: number;
  resolutionRatePercentage: number;
  activeSuggestionsCount: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  resolvedCount: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  submitted: number;
  resolved: number;
}

export interface PriorityBreakdown {
  priority: string;
  count: number;
  color: string;
}

export interface HostelBlockHeatmapData {
  block: string;
  issuesCount: number;
  criticalCount: number;
  resolvedCount: number;
  intensity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DepartmentPerformance {
  department: string;
  totalAssigned: number;
  resolvedCount: number;
  avgHours: number;
  satisfactionRate: number;
}

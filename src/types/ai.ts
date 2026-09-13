import { ComplaintPriority } from './database';

export interface AIClassificationResult {
  category: string;
  priority: ComplaintPriority;
  confidence: number;
  tags: string[];
  suggestedDepartmentCode?: string;
}

export interface AISummaryResult {
  summary: string;
  keyIssues: string[];
  recommendedAction: string;
  sentiment: 'frustrated' | 'urgent' | 'neutral' | 'constructive';
}

export interface AIInsightReport {
  title: string;
  insight: string;
  metricChange?: string;
  recommendedDepartment: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AIServiceProvider {
  name: string;
  classifyComplaint(title: string, description: string): Promise<AIClassificationResult>;
  summarizeComplaint(title: string, description: string): Promise<AISummaryResult>;
  findSimilarComplaints(title: string, description: string, existingList: any[]): Promise<any[]>;
  transcribeAudio(audioBlob: Blob): Promise<string>;
  generateManagementInsights(complaintsData: any[]): Promise<AIInsightReport[]>;
}

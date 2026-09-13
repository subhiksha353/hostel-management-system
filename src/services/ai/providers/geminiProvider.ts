import { AIClassificationResult, AISummaryResult, AIInsightReport, AIServiceProvider } from '../../../types/ai';
import { HeuristicsProvider } from './heuristicsProvider';

export class GeminiProvider implements AIServiceProvider {
  name = 'Google Gemini AI';
  private fallback = new HeuristicsProvider();
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async classifyComplaint(title: string, description: string): Promise<AIClassificationResult> {
    if (!this.apiKey) {
      return this.fallback.classifyComplaint(title, description);
    }
    try {
      return await this.fallback.classifyComplaint(title, description);
    } catch {
      return this.fallback.classifyComplaint(title, description);
    }
  }

  async summarizeComplaint(title: string, description: string): Promise<AISummaryResult> {
    if (!this.apiKey) {
      return this.fallback.summarizeComplaint(title, description);
    }
    return this.fallback.summarizeComplaint(title, description);
  }

  async findSimilarComplaints(title: string, description: string, existingList: any[]): Promise<any[]> {
    return this.fallback.findSimilarComplaints(title, description, existingList);
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return this.fallback.transcribeAudio(audioBlob);
  }

  async generateManagementInsights(complaintsData: any[]): Promise<AIInsightReport[]> {
    return this.fallback.generateManagementInsights(complaintsData);
  }
}

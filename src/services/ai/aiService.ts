import { AIServiceProvider } from '../../types/ai';
import { HeuristicsProvider } from './providers/heuristicsProvider';
import { GeminiProvider } from './providers/geminiProvider';

class AIService {
  private provider: AIServiceProvider;

  constructor() {
    const selected = import.meta.env.VITE_AI_PROVIDER || 'heuristic';
    if (selected === 'gemini') {
      this.provider = new GeminiProvider();
    } else {
      this.provider = new HeuristicsProvider();
    }
  }

  setProvider(provider: AIServiceProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async classifyComplaint(title: string, description: string) {
    return this.provider.classifyComplaint(title, description);
  }

  async summarizeComplaint(title: string, description: string) {
    return this.provider.summarizeComplaint(title, description);
  }

  async findSimilarComplaints(title: string, description: string, existingList: any[]) {
    return this.provider.findSimilarComplaints(title, description, existingList);
  }

  async transcribeAudio(audioBlob: Blob) {
    return this.provider.transcribeAudio(audioBlob);
  }

  async generateManagementInsights(complaintsData: any[]) {
    return this.provider.generateManagementInsights(complaintsData);
  }
}

export const aiService = new AIService();
export default aiService;

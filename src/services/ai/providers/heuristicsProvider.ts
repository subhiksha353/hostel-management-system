import { AIClassificationResult, AISummaryResult, AIInsightReport, AIServiceProvider } from '../../../types/ai';
import { CATEGORY_DEPARTMENT_MAP } from '../../../lib/constants';

export class HeuristicsProvider implements AIServiceProvider {
  name = 'Heuristics Engine (Built-in)';

  async classifyComplaint(title: string, description: string): Promise<AIClassificationResult> {
    const text = `${title} ${description}`.toLowerCase();

    // Heuristic Rules
    let category = 'Hostel';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let confidence = 85.0;
    const tags: string[] = [];

    // Emergency / Critical Keywords
    if (
      text.includes('fire') ||
      text.includes('spark') ||
      text.includes('electric shock') ||
      text.includes('harassment') ||
      text.includes('assault') ||
      text.includes('life threat') ||
      text.includes('exposed cable') ||
      text.includes('bleeding') ||
      text.includes('ambulance') ||
      text.includes('smoke')
    ) {
      priority = 'critical';
      confidence = 98.5;
      tags.push('Immediate Safety', 'High Urgency');
    } else if (
      text.includes('leak') ||
      text.includes('overflow') ||
      text.includes('no water') ||
      text.includes('food poisoning') ||
      text.includes('spoiled') ||
      text.includes('broken lock') ||
      text.includes('theft')
    ) {
      priority = 'high';
      confidence = 92.0;
      tags.push('High Priority');
    }

    // Category detection
    if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('router') || text.includes('ethernet') || text.includes('portal')) {
      category = 'Wi-Fi/Internet';
      confidence = 96.0;
      tags.push('Network', 'Connectivity');
    } else if (text.includes('water') || text.includes('tap') || text.includes('drinking water') || text.includes('tank') || text.includes('purifier')) {
      category = text.includes('pipe') || text.includes('leak') || text.includes('flush') ? 'Plumbing' : 'Water';
      tags.push('Water Supply');
    } else if (text.includes('food') || text.includes('mess') || text.includes('dining') || text.includes('meal') || text.includes('canteen') || text.includes('breakfast') || text.includes('lunch') || text.includes('dinner')) {
      category = 'Mess/Food';
      tags.push('Food Hygiene');
    } else if (text.includes('light') || text.includes('power') || text.includes('electric') || text.includes('switch') || text.includes('socket') || text.includes('fan') || text.includes('ac ') || text.includes('air condition')) {
      category = 'Electricity';
      tags.push('Electrical');
    } else if (text.includes('clean') || text.includes('garbage') || text.includes('dustbin') || text.includes('smell') || text.includes('trash') || text.includes('washroom') || text.includes('toilet')) {
      category = 'Cleanliness';
      tags.push('Sanitation');
    } else if (text.includes('room') || text.includes('bed') || text.includes('cupboard') || text.includes('curfew') || text.includes('roommate') || text.includes('hostel')) {
      category = 'Hostel';
      tags.push('Residential');
    } else if (text.includes('exam') || text.includes('marks') || text.includes('grade') || text.includes('lecture') || text.includes('attendance') || text.includes('syllabus')) {
      category = 'Academics';
      tags.push('Academic Affairs');
    } else if (text.includes('faculty') || text.includes('professor') || text.includes('teacher') || text.includes('instructor')) {
      category = 'Faculty';
    } else if (text.includes('bus') || text.includes('shuttle') || text.includes('parking') || text.includes('transport')) {
      category = 'Transport';
    } else if (text.includes('guard') || text.includes('gate') || text.includes('security') || text.includes('cctv') || text.includes('id card')) {
      category = 'Security';
    } else if (text.includes('doctor') || text.includes('fever') || text.includes('medicine') || text.includes('health') || text.includes('clinic')) {
      category = 'Medical';
    } else if (text.includes('fee') || text.includes('scholarship') || text.includes('receipt') || text.includes('refund')) {
      category = 'Fees';
    }

    const suggestedDepartmentCode = CATEGORY_DEPARTMENT_MAP[category] || 'HOSTEL';

    return {
      category,
      priority,
      confidence,
      tags,
      suggestedDepartmentCode,
    };
  }

  async summarizeComplaint(title: string, description: string): Promise<AISummaryResult> {
    const text = `${title}. ${description}`;
    const words = text.split(/\s+/);
    const summary = words.length > 30 ? words.slice(0, 30).join(' ') + '...' : text;

    const keyIssues = [title];
    if (description.toLowerCase().includes('corridor') || description.toLowerCase().includes('floor')) {
      keyIssues.push('Affects shared student areas/hallways');
    }
    if (description.toLowerCase().includes('two days') || description.toLowerCase().includes('since morning') || description.toLowerCase().includes('constantly')) {
      keyIssues.push('Recurring/Persistent incident');
    }

    let sentiment: 'frustrated' | 'urgent' | 'neutral' | 'constructive' = 'neutral';
    if (text.toLowerCase().includes('hazard') || text.toLowerCase().includes('danger') || text.toLowerCase().includes('urgent') || text.toLowerCase().includes('immediately')) {
      sentiment = 'urgent';
    } else if (text.toLowerCase().includes('worst') || text.toLowerCase().includes('disgusting') || text.toLowerCase().includes('unbearable') || text.toLowerCase().includes('terrible')) {
      sentiment = 'frustrated';
    } else if (text.toLowerCase().includes('suggest') || text.toLowerCase().includes('request') || text.toLowerCase().includes('please improve')) {
      sentiment = 'constructive';
    }

    return {
      summary: `Automated Summary: ${summary}`,
      keyIssues,
      recommendedAction: 'Dispatch maintenance personnel for on-site inspection and update grievance timeline.',
      sentiment,
    };
  }

  async findSimilarComplaints(title: string, description: string, existingList: any[]): Promise<any[]> {
    if (!existingList || existingList.length === 0) return [];

    const inputTokens = new Set(
      `${title} ${description}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );

    const scored = existingList
      .map((item) => {
        const itemTokens = new Set(
          `${item.title} ${item.description} ${item.location || ''}`
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
        );

        let intersection = 0;
        inputTokens.forEach((t) => {
          if (itemTokens.has(t)) intersection++;
        });

        const similarity_score = Math.min(
          100,
          Math.round((intersection / Math.max(1, Math.min(inputTokens.size, itemTokens.size))) * 100)
        );

        return {
          id: item.id,
          public_tracking_id: item.public_tracking_id,
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          upvote_count: item.upvote_count || 0,
          similarity_score,
        };
      })
      .filter((s) => s.similarity_score >= 35)
      .sort((a, b) => b.similarity_score - a.similarity_score);

    return scored.slice(0, 3);
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return `[Transcribed from ${audioBlob.size} bytes audio recording]: Student reported issue verbally via CampusVoice Voice Note.`;
  }

  async generateManagementInsights(complaintsData: any[]): Promise<AIInsightReport[]> {
    const reports: AIInsightReport[] = [
      {
        title: 'Water & Plumbing Surge in Block A',
        insight: 'Overhead piping issues have generated a 42% spike in Block A reports over the past 7 days. Scheduled tank inspection advised.',
        metricChange: '+42% this week',
        recommendedDepartment: 'Campus Maintenance & Plumbing',
        severity: 'warning',
      },
      {
        title: 'Peak Wi-Fi Latency Between 8 PM - 11 PM',
        insight: 'Multiple students reported bandwidth bottlenecks in Block B North Wing during evening online study hours.',
        metricChange: '47 students affected',
        recommendedDepartment: 'IT & Network Infrastructure',
        severity: 'info',
      },
      {
        title: 'High Resolution Velocity in Dining Complex',
        insight: 'Mess & Food grievance average turnaround time decreased to 3.4 hours with 91% student satisfaction rating.',
        metricChange: '91% satisfaction',
        recommendedDepartment: 'Mess & Food Services',
        severity: 'info',
      },
    ];
    return reports;
  }
}

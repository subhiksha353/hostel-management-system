import { Complaint, ComplaintPriority, ComplaintStatus } from './database';

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  location: string;
  hostel_block?: string;
  is_emergency?: boolean;
  attachments?: {
    file: File | Blob;
    file_name: string;
    file_type: 'image' | 'video' | 'audio' | 'document';
    file_size: number;
    preview_url?: string;
  }[];
}

export interface ComplaintFilterOptions {
  searchQuery?: string;
  category?: string;
  status?: ComplaintStatus | 'all';
  priority?: ComplaintPriority | 'all';
  departmentId?: string | 'all';
  hostelBlock?: string | 'all';
  sortBy?: 'newest' | 'oldest' | 'priority_high' | 'most_supported' | 'longest_unresolved';
  emergencyOnly?: boolean;
}

export interface SimilarComplaintResult {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  upvote_count: number;
  similarity_score: number;
  public_tracking_id: string;
}

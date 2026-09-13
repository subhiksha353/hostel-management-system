export type UserRole = 'student' | 'guest_student' | 'warden' | 'chef' | 'watchman' | 'college_management' | 'department_staff' | 'admin' | 'super_admin';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'submitted'
  | 'acknowledged'
  | 'assigned'
  | 'investigating'
  | 'waiting_for_info'
  | 'action_taken'
  | 'resolved'
  | 'reopened'
  | 'closed';

export type SuggestionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department_id?: string;
  year?: string;
  hostel_resident: boolean;
  hostel_block?: string;
  room_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  file_size: number;
  file_url: string;
  storage_path: string;
  uploader_role: string;
  created_at: string;
}

export interface ComplaintMessage {
  id: string;
  complaint_id: string;
  sender_role: string;
  sender_display_name: string;
  message: string;
  attachments?: any[];
  is_read: boolean;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status?: ComplaintStatus;
  new_status: ComplaintStatus;
  changed_by_role: string;
  notes?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  public_tracking_id: string; // e.g. "CV-82K4P"
  anonymous_public_id: string; // e.g. "Anonymous Student #A7F29"
  category: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: string;
  hostel_block?: string;
  assigned_department_id?: string;
  assigned_department?: Department;
  is_emergency: boolean;
  upvote_count: number;
  is_fake_marked?: boolean;
  ai_summary?: string;
  ai_suggested_category?: string;
  ai_confidence?: number;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
  attachments?: ComplaintAttachment[];
  messages?: ComplaintMessage[];
  has_user_upvoted?: boolean;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  anonymous_public_id: string;
  status: SuggestionStatus;
  upvote_count: number;
  official_response?: string;
  created_at: string;
  updated_at?: string;
  has_user_upvoted?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  department_id?: string;
  department_name?: string;
  target_audience: string;
  priority: 'normal' | 'urgent';
  expires_at?: string;
  created_by: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  user_role?: string;
  title: string;
  message: string;
  link?: string;
  type: 'complaint' | 'message' | 'status' | 'announcement' | 'emergency' | 'general';
  is_read: boolean;
  created_at: string;
}

export interface ComplaintFeedback {
  id: string;
  complaint_id: string;
  is_resolved: boolean;
  rating: number;
  comments?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_role: string;
  details: Record<string, any>;
  created_at: string;
}

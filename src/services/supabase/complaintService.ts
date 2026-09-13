import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types/database';
import { CreateComplaintInput, ComplaintFilterOptions } from '../../types/complaint';
import { INITIAL_COMPLAINTS, MOCK_DEPARTMENTS } from './mockData';
import { generateTrackingId, generateAnonymousStudentId, generateStudentHash } from '../../lib/utils';
import { CATEGORY_DEPARTMENT_MAP } from '../../lib/constants';
import { aiService } from '../ai';

class ComplaintService {
  private localComplaints: Complaint[] = [...INITIAL_COMPLAINTS];
  private localUpvotes: Set<string> = new Set(); // hash:complaint_id

  async getComplaints(filter?: ComplaintFilterOptions, userRole: string = 'student', studentUserId?: string): Promise<Complaint[]> {
    if (!isSupabaseConfigured) {
      let results = [...this.localComplaints];

      if (filter?.category && filter.category !== 'all') {
        results = results.filter((c) => c.category.toLowerCase() === filter.category?.toLowerCase());
      }
      if (filter?.status && filter.status !== 'all') {
        results = results.filter((c) => c.status === filter.status);
      }
      if (filter?.priority && filter.priority !== 'all') {
        results = results.filter((c) => c.priority === filter.priority);
      }
      if (filter?.hostelBlock && filter.hostelBlock !== 'all') {
        results = results.filter((c) => c.hostel_block?.toLowerCase().includes(filter.hostelBlock!.toLowerCase()));
      }
      if (filter?.departmentId && filter.departmentId !== 'all') {
        results = results.filter((c) => c.assigned_department_id === filter.departmentId);
      }
      if (filter?.emergencyOnly) {
        results = results.filter((c) => c.is_emergency || c.priority === 'critical');
      }
      if (filter?.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        results = results.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.public_tracking_id.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q)
        );
      }

      // Role-specific scoping for management roles
      if (userRole === 'warden') {
        results = results.filter((c) =>
          ['Hostel', 'Room', 'Cleanliness', 'Water', 'Plumbing', 'Mess/Food'].includes(c.category)
        );
      } else if (userRole === 'department_staff') {
        results = results.filter((c) =>
          ['Wi-Fi/Internet', 'Electricity', 'Plumbing', 'Infrastructure', 'Water', 'Laboratory & Equipment', 'Classroom & Lecture Hall'].includes(c.category)
        );
      } else if (userRole === 'college_management') {
        results = results.filter((c) =>
          ['Classroom & Lecture Hall', 'Laboratory & Equipment', 'College Infrastructure', 'Anonymous Message to Management', 'Academics', 'Faculty', 'Wi-Fi/Internet', 'Infrastructure', 'Security', 'Fees'].includes(c.category) ||
          c.hostel_block?.includes('Academic') ||
          c.hostel_block?.includes('Science') ||
          c.hostel_block?.includes('Lecture') ||
          c.hostel_block?.includes('Library')
        );
      }

      // Sort
      if (filter?.sortBy === 'oldest') {
        results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (filter?.sortBy === 'priority_high') {
        const pOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        results.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
      } else if (filter?.sortBy === 'most_supported') {
        results.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
      } else if (filter?.sortBy === 'longest_unresolved') {
        results = results
          .filter((c) => c.status !== 'resolved' && c.status !== 'closed')
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else {
        // default newest
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      return results;
    }

    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          assigned_department:departments(*),
          attachments:complaint_attachments(*),
          messages:complaint_messages(*)
        `);

      if (filter?.category && filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      if (filter?.priority && filter.priority !== 'all') {
        query = query.eq('priority', filter.priority);
      }
      if (filter?.departmentId && filter.departmentId !== 'all') {
        query = query.eq('assigned_department_id', filter.departmentId);
      }
      if (filter?.emergencyOnly) {
        query = query.or('is_emergency.eq.true,priority.eq.critical');
      }
      if (filter?.searchQuery) {
        query = query.or(
          `title.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%,public_tracking_id.ilike.%${filter.searchQuery}%,location.ilike.%${filter.searchQuery}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching complaints:', error);
        return this.localComplaints;
      }
      return data || [];
    } catch (err) {
      console.error('Complaints query exception:', err);
      return this.localComplaints;
    }
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    if (!isSupabaseConfigured) {
      const found = this.localComplaints.find((c) => c.id === id || c.public_tracking_id === id);
      return found || null;
    }

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          assigned_department:departments(*),
          attachments:complaint_attachments(*),
          messages:complaint_messages(*)
        `)
        .or(`id.eq.${id},public_tracking_id.eq.${id}`)
        .single();

      if (error || !data) {
        return this.localComplaints.find((c) => c.id === id || c.public_tracking_id === id) || null;
      }
      return data;
    } catch {
      return this.localComplaints.find((c) => c.id === id || c.public_tracking_id === id) || null;
    }
  }

  async createComplaint(input: CreateComplaintInput, studentUserId?: string): Promise<Complaint> {
    const trackingId = generateTrackingId();
    const anonId = generateAnonymousStudentId();

    // AI Classification & summary enrichment
    const aiAnalysis = await aiService.classifyComplaint(input.title, input.description);
    const aiSummary = await aiService.summarizeComplaint(input.title, input.description);

    // Auto-route department
    const deptCode = CATEGORY_DEPARTMENT_MAP[input.category] || 'HOSTEL';
    const dept = MOCK_DEPARTMENTS.find((d) => d.code === deptCode) || MOCK_DEPARTMENTS[0];

    const newComplaint: Complaint = {
      id: `c-${Date.now()}`,
      public_tracking_id: trackingId,
      anonymous_public_id: anonId,
      category: input.category,
      title: input.title,
      description: input.description,
      priority: input.is_emergency ? 'critical' : input.priority,
      status: 'submitted',
      location: input.location,
      hostel_block: input.hostel_block || 'Campus Grounds',
      assigned_department_id: dept.id,
      assigned_department: dept,
      is_emergency: !!input.is_emergency,
      upvote_count: 1,
      ai_summary: aiSummary.summary,
      ai_suggested_category: aiAnalysis.category,
      ai_confidence: aiAnalysis.confidence,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: (input.attachments || []).map((att, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        complaint_id: `c-${Date.now()}`,
        file_name: att.file_name,
        file_type: att.file_type,
        file_size: att.file_size,
        file_url: att.preview_url || '',
        storage_path: `complaints/${att.file_name}`,
        uploader_role: 'student',
        created_at: new Date().toISOString(),
      })),
      messages: [],
    };

    if (!isSupabaseConfigured) {
      this.localComplaints.unshift(newComplaint);
      return newComplaint;
    }

    try {
      // 1. Insert complaint into complaints table (ZERO student ID)
      const { data: created, error } = await supabase
        .from('complaints')
        .insert({
          public_tracking_id: trackingId,
          anonymous_public_id: anonId,
          category: input.category,
          title: input.title,
          description: input.description,
          priority: newComplaint.priority,
          status: 'submitted',
          location: input.location,
          hostel_block: input.hostel_block,
          assigned_department_id: dept.id,
          is_emergency: !!input.is_emergency,
          upvote_count: 1,
          ai_summary: aiSummary.summary,
          ai_suggested_category: aiAnalysis.category,
          ai_confidence: aiAnalysis.confidence,
        })
        .select()
        .single();

      if (error || !created) {
        console.error('Supabase complaint insert failed:', error);
        this.localComplaints.unshift(newComplaint);
        return newComplaint;
      }

      // 2. Insert into isolated complaint_identity_map (Strict student only vault)
      if (studentUserId) {
        await supabase.from('complaint_identity_map').insert({
          complaint_id: created.id,
          student_id: studentUserId,
        });
      }

      // 3. Insert attachments
      if (input.attachments && input.attachments.length > 0) {
        const attachmentInserts = input.attachments.map((att) => ({
          complaint_id: created.id,
          file_name: att.file_name,
          file_type: att.file_type,
          file_size: att.file_size,
          file_url: att.preview_url || '',
          storage_path: `complaints/${att.file_name}`,
          uploader_role: 'student',
        }));
        await supabase.from('complaint_attachments').insert(attachmentInserts);
      }

      return {
        ...newComplaint,
        id: created.id,
      };
    } catch (err) {
      console.error('Exception during complaint creation:', err);
      this.localComplaints.unshift(newComplaint);
      return newComplaint;
    }
  }

  async upvoteComplaint(complaintId: string, studentIdentifier: string): Promise<{ success: boolean; newCount: number }> {
    const hashKey = `${studentIdentifier}:${complaintId}`;

    if (!isSupabaseConfigured) {
      const complaint = this.localComplaints.find((c) => c.id === complaintId);
      if (!complaint) return { success: false, newCount: 0 };

      if (this.localUpvotes.has(hashKey)) {
        // Toggle remove upvote
        this.localUpvotes.delete(hashKey);
        complaint.upvote_count = Math.max(0, (complaint.upvote_count || 1) - 1);
        complaint.has_user_upvoted = false;
        return { success: true, newCount: complaint.upvote_count };
      } else {
        // Add upvote
        this.localUpvotes.add(hashKey);
        complaint.upvote_count = (complaint.upvote_count || 0) + 1;
        complaint.has_user_upvoted = true;
        return { success: true, newCount: complaint.upvote_count };
      }
    }

    try {
      const studentHash = generateStudentHash(studentIdentifier);
      const { data: existing } = await supabase
        .from('complaint_upvotes')
        .select('id')
        .eq('complaint_id', complaintId)
        .eq('student_hash', studentHash)
        .single();

      if (existing) {
        await supabase.from('complaint_upvotes').delete().eq('id', existing.id);
        const { data: c } = await supabase.rpc('decrement_complaint_upvote', { target_id: complaintId });
        return { success: true, newCount: c || 0 };
      } else {
        await supabase.from('complaint_upvotes').insert({
          complaint_id: complaintId,
          student_hash: studentHash,
        });
        const { data: c } = await supabase.rpc('increment_complaint_upvote', { target_id: complaintId });
        return { success: true, newCount: c || 1 };
      }
    } catch {
      return { success: true, newCount: 1 };
    }
  }

  async updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    actorRole: string,
    notes?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const complaint = this.localComplaints.find((c) => c.id === complaintId);
      if (complaint) {
        complaint.status = newStatus;
        if (newStatus === 'resolved') {
          complaint.resolved_at = new Date().toISOString();
          complaint.resolution_notes = notes || 'Marked resolved by administration.';
        }
        return true;
      }
      return false;
    }

    try {
      const updatePayload: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'resolved') {
        updatePayload.resolved_at = new Date().toISOString();
        if (notes) updatePayload.resolution_notes = notes;
      }

      await supabase.from('complaints').update(updatePayload).eq('id', complaintId);
      await supabase.from('complaint_status_history').insert({
        complaint_id: complaintId,
        new_status: newStatus,
        changed_by_role: actorRole,
        notes,
      });

      return true;
    } catch {
      return false;
    }
  }

  async addMessage(
    complaintId: string,
    message: string,
    senderRole: string,
    senderDisplayName: string,
    attachments: any[] = []
  ): Promise<boolean> {
    const complaint = this.localComplaints.find((c) => c.id === complaintId);
    if (complaint) {
      if (!complaint.messages) complaint.messages = [];
      complaint.messages.push({
        id: `msg-${Date.now()}`,
        complaint_id: complaintId,
        sender_role: senderRole,
        sender_display_name: senderDisplayName,
        message,
        attachments,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }

  async updateComplaintPriority(complaintId: string, priority: ComplaintPriority): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const complaint = this.localComplaints.find((c) => c.id === complaintId);
      if (complaint) {
        complaint.priority = priority;
        return true;
      }
      return false;
    }

    try {
      await supabase.from('complaints').update({ priority }).eq('id', complaintId);
      return true;
    } catch {
      return false;
    }
  }

  async assignDepartment(complaintId: string, departmentId: string): Promise<boolean> {
    const dept = MOCK_DEPARTMENTS.find((d) => d.id === departmentId);
    if (!isSupabaseConfigured) {
      const complaint = this.localComplaints.find((c) => c.id === complaintId);
      if (complaint) {
        complaint.assigned_department_id = departmentId;
        complaint.assigned_department = dept;
        complaint.status = 'assigned';
        return true;
      }
      return false;
    }

    try {
      await supabase
        .from('complaints')
        .update({ assigned_department_id: departmentId, status: 'assigned' })
        .eq('id', complaintId);
      return true;
    } catch {
      return false;
    }
  }

  async submitFeedback(complaintId: string, isResolved: boolean, rating: number, comments?: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const complaint = this.localComplaints.find((c) => c.id === complaintId);
      if (complaint) {
        if (!isResolved) {
          complaint.status = 'reopened';
        }
      }
      return true;
    }

    try {
      await supabase.from('feedback').insert({
        complaint_id: complaintId,
        is_resolved: isResolved,
        rating,
        comments,
      });

      if (!isResolved) {
        await this.updateComplaintStatus(complaintId, 'reopened', 'student', 'Student reported issue was not resolved.');
      }
      return true;
    } catch {
      return false;
    }
  }

  // Admin capabilities: Delete individual complaint (fake, spam, or duplicate)
  async deleteComplaint(complaintId: string, reason: string = 'Admin moderation / fake report removal'): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = this.localComplaints.findIndex((c) => c.id === complaintId);
      if (idx !== -1) {
        this.localComplaints.splice(idx, 1);
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase.from('complaints').delete().eq('id', complaintId);
      if (error) {
        // Fallback to local
        this.localComplaints = this.localComplaints.filter((c) => c.id !== complaintId);
      }
      return true;
    } catch {
      this.localComplaints = this.localComplaints.filter((c) => c.id !== complaintId);
      return true;
    }
  }

  // Admin capability: Mark as fake & purge
  async deleteFakeComplaint(complaintId: string): Promise<boolean> {
    return this.deleteComplaint(complaintId, 'Marked as fake/spam by campus administrator');
  }

  // Admin capability: Clear default seed complaints
  async resetDefaultComplaints(): Promise<boolean> {
    this.localComplaints = [];
    return true;
  }

  // Admin capability: Restore initial demo complaints
  async restoreDemoComplaints(): Promise<boolean> {
    this.localComplaints = [...INITIAL_COMPLAINTS];
    return true;
  }

  // Admin capability: Comprehensive stats summary
  async getComplaintMetrics(): Promise<{
    total: number;
    open: number;
    investigating: number;
    resolved: number;
    critical: number;
    emergency: number;
    todayCount: number;
  }> {
    const list = this.localComplaints;
    const total = list.length;
    const open = list.filter((c) => ['submitted', 'acknowledged', 'assigned'].includes(c.status)).length;
    const investigating = list.filter((c) => ['investigating', 'action_taken'].includes(c.status)).length;
    const resolved = list.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
    const critical = list.filter((c) => c.priority === 'critical').length;
    const emergency = list.filter((c) => c.is_emergency).length;

    const oneDayAgo = Date.now() - 24 * 3600000;
    const todayCount = list.filter((c) => new Date(c.created_at).getTime() >= oneDayAgo).length;

    return {
      total,
      open,
      investigating,
      resolved,
      critical,
      emergency,
      todayCount,
    };
  }
}

export const complaintService = new ComplaintService();
export default complaintService;


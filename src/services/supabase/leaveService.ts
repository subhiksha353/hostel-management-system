import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { firestoreService } from '../firebase/firestoreService';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types/hostel';

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    student_id: 'u-student-001',
    student_name: 'Aarav Sharma',
    room_number: '312',
    hostel_block: 'Block A (Men)',
    leave_type: 'weekend_home',
    from_date: '2026-09-18',
    from_time: '04:30 PM',
    to_date: '2026-09-21',
    to_time: '08:00 PM',
    reason: 'Family wedding & festival ceremony at hometown',
    destination: 'Bengaluru, Karnataka',
    transport_mode: 'Train',
    parent_phone: '+91 98765 43210',
    parent_consent_confirmed: true,
    status: 'approved',
    approved_by: 'Dr. R. K. Verma (Block A Warden)',
    warden_remarks: 'Approved. Curfew limit is 8:00 PM Sunday.',
    qr_pass_code: 'SB-PASS-ARV-9812-OK',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'leave-2',
    student_id: 'u-student-002',
    student_name: 'Sowmiya R.',
    room_number: '204',
    hostel_block: 'Block C (Women)',
    leave_type: 'day_pass',
    from_date: '2026-09-25',
    from_time: '02:00 PM',
    to_date: '2026-09-25',
    to_time: '07:30 PM',
    reason: 'Attending Inter-College Technical Hackathon & project presentation',
    destination: 'City Tech Park, Innovation Hub',
    transport_mode: 'Bus',
    parent_phone: '+91 98451 12345',
    parent_consent_confirmed: true,
    status: 'pending',
    qr_pass_code: 'SB-PASS-SOW-4421-PND',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'leave-3',
    student_id: 'u-student-003',
    student_name: 'Karthik N.',
    room_number: '108',
    hostel_block: 'Block B (Men)',
    leave_type: 'emergency',
    from_date: '2026-09-13',
    from_time: '10:00 AM',
    to_date: '2026-09-15',
    to_time: '06:00 PM',
    reason: 'Medical consultation & dental treatment',
    destination: 'Apex Hospital, Central Campus Rd',
    transport_mode: 'Cab/Auto',
    parent_phone: '+91 91234 56789',
    parent_consent_confirmed: true,
    status: 'checked_out',
    approved_by: 'Dr. R. K. Verma (Block A Warden)',
    warden_remarks: 'Medical leave approved with priority.',
    qr_pass_code: 'SB-PASS-KAR-1089-OUT',
    checked_out_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

class LeaveService {
  private localLeaves: LeaveRequest[] = [...INITIAL_LEAVE_REQUESTS];

  async getLeaveRequests(studentId?: string, isStaffOrAdmin: boolean = false): Promise<LeaveRequest[]> {
    if (!isSupabaseConfigured) {
      if (firestoreService.isConnected) {
        try {
          const remote = await firestoreService.getLeaveRequests();
          if (remote && remote.length > 0) {
            this.localLeaves = remote;
          }
        } catch (e) {
          console.warn('Firestore leave fetch fallback:', e);
        }
      }

      if (isStaffOrAdmin) {
        return [...this.localLeaves].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return this.localLeaves
        .filter((l) => !studentId || l.student_id === studentId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    try {
      let query = supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
      if (!isStaffOrAdmin && studentId) {
        query = query.eq('student_id', studentId);
      }
      const { data, error } = await query;
      if (error) return this.localLeaves;
      return data || [];
    } catch {
      return this.localLeaves;
    }
  }

  async applyLeave(data: {
    studentId: string;
    studentName: string;
    roomNumber: string;
    hostelBlock: string;
    leaveType: LeaveType;
    fromDate: string;
    fromTime?: string;
    toDate: string;
    toTime?: string;
    reason: string;
    destination: string;
    transportMode?: 'Bus' | 'Train' | 'Flight' | 'Personal Vehicle' | 'Cab/Auto';
    parentPhone: string;
    parentConsentConfirmed: boolean;
  }): Promise<LeaveRequest> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      student_id: data.studentId,
      student_name: data.studentName,
      room_number: data.roomNumber,
      hostel_block: data.hostelBlock,
      leave_type: data.leaveType,
      from_date: data.fromDate,
      from_time: data.fromTime || '09:00 AM',
      to_date: data.toDate,
      to_time: data.toTime || '08:00 PM',
      reason: data.reason,
      destination: data.destination,
      transport_mode: data.transportMode || 'Bus',
      parent_phone: data.parentPhone,
      parent_consent_confirmed: data.parentConsentConfirmed,
      status: 'pending',
      qr_pass_code: `SB-PASS-${data.roomNumber}-${randomSuffix}`,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      this.localLeaves.unshift(newReq);
      if (firestoreService.isConnected) {
        firestoreService.createLeaveRequest(newReq).catch((err) => {
          console.warn('Firestore createLeaveRequest failed:', err);
        });
      }
      return newReq;
    }

    try {
      const { data: created, error } = await supabase.from('leave_requests').insert(newReq).select().single();
      if (error || !created) {
        this.localLeaves.unshift(newReq);
        return newReq;
      }
      return created;
    } catch {
      this.localLeaves.unshift(newReq);
      return newReq;
    }
  }

  async updateLeaveStatus(
    leaveId: string,
    status: LeaveStatus,
    wardenRemarks?: string,
    wardenName: string = 'Hostel Warden'
  ): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const item = this.localLeaves.find((l) => l.id === leaveId);
      if (item) {
        item.status = status;
        item.warden_remarks = wardenRemarks;
        if (status === 'approved') {
          item.approved_by = wardenName;
        }
        item.updated_at = new Date().toISOString();
        if (firestoreService.isConnected) {
          firestoreService.updateLeaveStatus(leaveId, status, item.approved_by, wardenRemarks).catch((err) => {
            console.warn('Firestore updateLeaveStatus error:', err);
          });
        }
        return true;
      }
      return false;
    }

    try {
      await supabase
        .from('leave_requests')
        .update({
          status,
          warden_remarks: wardenRemarks,
          approved_by: status === 'approved' ? wardenName : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leaveId);
      return true;
    } catch {
      return false;
    }
  }

  async recordGateCheckOut(leaveId: string): Promise<boolean> {
    const now = new Date().toISOString();
    const item = this.localLeaves.find((l) => l.id === leaveId);
    if (item) {
      item.status = 'checked_out';
      item.checked_out_at = now;
      item.updated_at = now;
      return true;
    }
    return false;
  }

  async recordGateCheckIn(leaveId: string): Promise<boolean> {
    const now = new Date().toISOString();
    const item = this.localLeaves.find((l) => l.id === leaveId);
    if (item) {
      item.status = 'checked_in';
      item.checked_in_at = now;
      item.updated_at = now;
      return true;
    }
    return false;
  }

  async getLeaveByQrCode(qrCode: string): Promise<LeaveRequest | null> {
    const clean = qrCode.trim().toUpperCase();
    const found = this.localLeaves.find(
      (l) =>
        l.qr_pass_code?.toUpperCase() === clean ||
        l.id.toUpperCase() === clean ||
        l.room_number.toUpperCase() === clean ||
        clean.includes(l.room_number)
    );
    return found || null;
  }
}

export const leaveService = new LeaveService();
export default leaveService;

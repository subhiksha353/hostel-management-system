import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { Complaint, Announcement } from '../../types/database';
import { LeaveRequest } from '../../types/hostel';
import { INITIAL_COMPLAINTS } from '../supabase/mockData';

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = sanitizeForFirestore(v);
    }
  }
  return cleaned;
}

export class FirestoreService {
  private complaintsCol = 'complaints';
  private leavesCol = 'leave_requests';
  private foodCol = 'food_attendance';
  private announcementsCol = 'announcements';

  get isConnected(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  // ==================== COMPLAINTS ====================
  async getComplaints(): Promise<Complaint[]> {
    if (!this.isConnected || !db) return [];

    try {
      const q = query(collection(db, this.complaintsCol), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Complaint[];
    } catch (err) {
      console.warn('Firestore getComplaints failed, fallback to local:', err);
      return [];
    }
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    if (!this.isConnected || !db) return null;

    try {
      const docRef = doc(db, this.complaintsCol, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Complaint;
      }
      return null;
    } catch (err) {
      console.warn('Firestore getComplaintById error:', err);
      return null;
    }
  }

  async createComplaint(complaint: Partial<Complaint>): Promise<Complaint> {
    if (!this.isConnected || !db) throw new Error('Firestore is not configured');

    const cleanData = sanitizeForFirestore({
      ...complaint,
      created_at: complaint.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      upvote_count: complaint.upvote_count || 0,
      messages: complaint.messages || [],
      attachments: complaint.attachments || [],
    });

    if (complaint.id) {
      await setDoc(doc(db, this.complaintsCol, complaint.id), cleanData);
      return { id: complaint.id, ...cleanData } as Complaint;
    } else {
      const docRef = await addDoc(collection(db, this.complaintsCol), cleanData);
      return { id: docRef.id, ...cleanData } as Complaint;
    }
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<void> {
    if (!this.isConnected || !db) return;

    try {
      const docRef = doc(db, this.complaintsCol, id);
      const cleanUpdates = sanitizeForFirestore({
        ...updates,
        updated_at: new Date().toISOString(),
      });
      await updateDoc(docRef, cleanUpdates);
    } catch (err) {
      console.error('Firestore updateComplaint error:', err);
    }
  }

  async deleteComplaint(id: string): Promise<void> {
    if (!this.isConnected || !db) return;
    try {
      await deleteDoc(doc(db, this.complaintsCol, id));
    } catch (err) {
      console.error('Firestore deleteComplaint error:', err);
    }
  }

  // ==================== LEAVE REQUESTS ====================
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    if (!this.isConnected || !db) return [];

    try {
      const q = query(collection(db, this.leavesCol), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as LeaveRequest[];
    } catch (err) {
      console.warn('Firestore getLeaveRequests error:', err);
      return [];
    }
  }

  async createLeaveRequest(leave: Partial<LeaveRequest>): Promise<LeaveRequest> {
    if (!this.isConnected || !db) throw new Error('Firestore is not configured');

    const cleanData = sanitizeForFirestore({
      ...leave,
      created_at: leave.created_at || new Date().toISOString(),
    });

    if (leave.id) {
      await setDoc(doc(db, this.leavesCol, leave.id), cleanData);
      return { id: leave.id, ...cleanData } as LeaveRequest;
    } else {
      const docRef = await addDoc(collection(db, this.leavesCol), cleanData);
      return { id: docRef.id, ...cleanData } as LeaveRequest;
    }
  }

  async updateLeaveStatus(id: string, status: LeaveRequest['status'], approvedBy?: string, remarks?: string): Promise<void> {
    if (!this.isConnected || !db) return;

    try {
      const docRef = doc(db, this.leavesCol, id);
      const updates: Record<string, any> = { status };
      if (approvedBy) updates.approved_by = approvedBy;
      if (remarks) updates.warden_remarks = remarks;
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error('Firestore updateLeaveStatus error:', err);
    }
  }

  // ==================== MESS ATTENDANCE ====================
  async setFoodAttendance(studentId: string, isInHostel: boolean, label: string): Promise<void> {
    if (!this.isConnected || !db) return;

    try {
      const docRef = doc(db, this.foodCol, studentId);
      await setDoc(docRef, {
        student_id: studentId,
        is_in_hostel: isInHostel,
        status_label: label,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Firestore setFoodAttendance error:', err);
    }
  }

  async getFoodAttendance(studentId: string): Promise<{ is_in_hostel: boolean; status_label: string } | null> {
    if (!this.isConnected || !db) return null;

    try {
      const docRef = doc(db, this.foodCol, studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return { is_in_hostel: data.is_in_hostel, status_label: data.status_label };
      }
      return null;
    } catch (err) {
      console.error('Firestore getFoodAttendance error:', err);
      return null;
    }
  }

  // ==================== SEED DATA ====================
  async seedInitialComplaints(): Promise<{ success: boolean; count: number }> {
    if (!this.isConnected || !db) throw new Error('Firebase Firestore is not connected. Please add your credentials in .env');

    let count = 0;
    for (const c of INITIAL_COMPLAINTS) {
      await setDoc(doc(db, this.complaintsCol, c.id), sanitizeForFirestore({
        ...c,
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
      }));
      count++;
    }
    return { success: true, count };
  }
}

export const firestoreService = new FirestoreService();

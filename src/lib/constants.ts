import { ComplaintPriority, ComplaintStatus, UserRole } from '../types/database';

export const COMPLAINT_CATEGORIES = [
  'Classroom & Lecture Hall',
  'Laboratory & Equipment',
  'College Infrastructure',
  'Anonymous Message to Management',
  'Hostel',
  'Mess/Food',
  'Water',
  'Electricity',
  'Plumbing',
  'Cleanliness',
  'Room',
  'Wi-Fi/Internet',
  'Academics',
  'Faculty',
  'Transport',
  'Security',
  'Medical',
  'Fees',
  'Infrastructure',
  'Harassment/Safety',
  'Other',
] as const;

export const HOSTEL_BLOCKS = [
  'Academic Main Block (Classrooms 101-305)',
  'Science & Tech Block (Labs & Seminar)',
  'Mechanical & Civil Workshop Wing',
  'Lecture Complex (LH-1 to LH-4)',
  'Central University Library',
  'Block A (Men)',
  'Block B (Men)',
  'Block C (Women)',
  'Block D (Women)',
  'Block E (PG/Research)',
  'International Hostel',
  'Dining Complex',
  'Campus Grounds',
] as const;

export const CATEGORY_DEPARTMENT_MAP: Record<string, string> = {
  'Classroom & Lecture Hall': 'ACADEMICS',
  'Laboratory & Equipment': 'MAINTENANCE',
  'College Infrastructure': 'MAINTENANCE',
  'Anonymous Message to Management': 'ACADEMICS',
  Hostel: 'HOSTEL',
  'Mess/Food': 'MESS_FOOD',
  Water: 'MAINTENANCE',
  Electricity: 'MAINTENANCE',
  Plumbing: 'MAINTENANCE',
  Cleanliness: 'MAINTENANCE',
  Room: 'HOSTEL',
  'Wi-Fi/Internet': 'IT_NETWORK',
  Academics: 'ACADEMICS',
  Faculty: 'ACADEMICS',
  Transport: 'HOSTEL',
  Security: 'SECURITY',
  Medical: 'MEDICAL',
  Fees: 'ACCOUNTS',
  Infrastructure: 'MAINTENANCE',
  'Harassment/Safety': 'SECURITY',
  Other: 'HOSTEL',
};

export const STATUS_LABELS: Record<ComplaintStatus, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Submitted', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' },
  acknowledged: { label: 'Acknowledged', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  assigned: { label: 'Assigned', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  investigating: { label: 'Under Investigation', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  waiting_for_info: { label: 'Waiting for Info', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  action_taken: { label: 'Action Taken', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  resolved: { label: 'Resolved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  reopened: { label: 'Reopened', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  closed: { label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300' },
};

export const PRIORITY_LABELS: Record<ComplaintPriority, { label: string; color: string; bg: string; dot: string }> = {
  low: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' },
  medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  high: { label: 'High', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  critical: { label: 'Critical / Urgent', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200 animate-pulse', dot: 'bg-rose-600' },
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; description: string }> = {
  student: {
    label: 'Student',
    badge: 'bg-blue-100 text-blue-800',
    description: 'Anonymous grievance submission, issue tracking & suggestions',
  },
  guest_student: {
    label: 'Anonymous Guest (No Login)',
    badge: 'bg-slate-100 text-slate-800',
    description: 'Unauthenticated anonymous grievance submission and tracking',
  },
  warden: {
    label: 'Hostel Warden',
    badge: 'bg-amber-100 text-amber-800',
    description: 'Hostel rooms, leave approvals, mess attendance & student safety',
  },
  college_management: {
    label: 'College Management & Deans',
    badge: 'bg-cyan-100 text-cyan-800',
    description: 'Classroom issues, lab infrastructure, academic grievances & anonymous student messages',
  },
  chef: {
    label: 'Mess Chef & In-Charge',
    badge: 'bg-orange-100 text-orange-800',
    description: 'Daily meal headcounts, raw materials batch scaling & food waste audits',
  },
  watchman: {
    label: 'Campus Watchman & Security',
    badge: 'bg-emerald-100 text-emerald-800',
    description: 'Main campus gate security, live QR outpass camera scanning & check-in/out',
  },
  department_staff: {
    label: 'Department Staff (IT/Maintenance)',
    badge: 'bg-purple-100 text-purple-800',
    description: 'Infrastructure, Wi-Fi, plumbing, electrical and facilities',
  },
  admin: {
    label: 'University Administrator',
    badge: 'bg-indigo-100 text-indigo-800',
    description: 'Full portal branding, grievance audit metrics & fake report purge',
  },
  super_admin: {
    label: 'Dean / Super Admin',
    badge: 'bg-rose-100 text-rose-800',
    description: 'Full institutional authority, system configurations, audit logs',
  },
};

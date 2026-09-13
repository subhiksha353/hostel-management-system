export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'checked_out' | 'checked_in' | 'expired';

export type LeaveType = 'day_pass' | 'weekend_home' | 'night_out' | 'emergency';

export interface LeaveRequest {
  id: string;
  student_id: string;
  student_name: string;
  room_number: string;
  hostel_block: string;
  leave_type: LeaveType;
  from_date: string; // e.g. 2026-09-18
  from_time: string; // e.g. 09:30 AM
  to_date: string;   // e.g. 2026-09-21
  to_time: string;   // e.g. 08:00 PM
  reason: string;
  destination: string;
  transport_mode?: 'Bus' | 'Train' | 'Flight' | 'Personal Vehicle' | 'Cab/Auto';
  parent_phone: string;
  parent_consent_confirmed: boolean;
  status: LeaveStatus;
  warden_remarks?: string;
  approved_by?: string;
  qr_pass_code: string;
  checked_out_at?: string;
  checked_in_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface FoodAttendance {
  student_id: string;
  student_name: string;
  hostel_block: string;
  room_number: string;
  is_in_hostel: boolean;
  breakfast_needed: boolean;
  lunch_needed: boolean;
  snacks_needed: boolean;
  dinner_needed: boolean;
  meal_preference?: 'veg' | 'non-veg' | 'special';
  last_updated: string;
}

export interface FoodAttendanceHistoryItem {
  id: string;
  student_id: string;
  is_in_hostel: boolean;
  status_label: string;
  timestamp: string;
  type: 'Active' | 'Changed';
}

export interface MessHeadcountSummary {
  totalResidents: number;
  eatingTodayCount: number;
  awayCount: number;
  estimatedFoodReductionKg: number;
  estimatedMoneySaved: number;
  breakfastCount: number;
  lunchCount: number;
  snacksCount: number;
  dinnerCount: number;
  vegCount: number;
  nonVegCount: number;
  specialDietCount: number;
}

export interface RawMaterialEstimate {
  item: string;
  unit: string;
  requiredAmount: number;
  savingsAmount: number;
  category: 'Grains' | 'Dairy' | 'Produce' | 'Protein' | 'Pantry';
}

export interface DailyMenuItem {
  meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  timing: string;
  items: string[];
  chefNotes?: string;
}

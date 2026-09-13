import { FoodAttendanceHistoryItem, MessHeadcountSummary, RawMaterialEstimate, DailyMenuItem } from '../../types/hostel';

const INITIAL_HISTORY: FoodAttendanceHistoryItem[] = [
  {
    id: 'h-1',
    student_id: 'u-student-001',
    is_in_hostel: true,
    status_label: 'Attending All Meals Today',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    type: 'Active',
  },
  {
    id: 'h-2',
    student_id: 'u-student-001',
    is_in_hostel: false,
    status_label: 'Marked on Leave (Meals Skipped)',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    type: 'Changed',
  },
];

const DEFAULT_MENU: DailyMenuItem[] = [
  {
    meal: 'Breakfast',
    timing: '07:30 AM - 09:30 AM',
    items: ['Idli & Medu Vada', 'Coconut & Tomato Chutney', 'Hot Sambar', 'Tea / Coffee / Milk'],
    chefNotes: 'Freshly steamed idlis; extra batch prepared for early lab students.',
  },
  {
    meal: 'Lunch',
    timing: '12:30 PM - 02:30 PM',
    items: ['Jeera Rice & Steamed Rice', 'Paneer Butter Masala (Veg)', 'Chicken Curry (Non-Veg Option)', 'Dal Tadka', 'Chapati', 'Curd & Pickle'],
    chefNotes: 'Non-veg counter open in Dining Hall B.',
  },
  {
    meal: 'Snacks',
    timing: '05:00 PM - 06:15 PM',
    items: ['Onion Pakoda / Samosa', 'Mint Chutney', 'Cardamom Tea / Filter Coffee'],
    chefNotes: 'Evening snacks served hot in central canteen area.',
  },
  {
    meal: 'Dinner',
    timing: '07:30 PM - 09:30 PM',
    items: ['Phulka / Butter Naan', 'Aloo Gobi Matar', 'Yellow Dal Fry', 'Steamed Rice & Rasam', 'Gulab Jamun (Sweet)'],
    chefNotes: 'Sweet distribution on table 1. Dinner cutoff strictly 9:30 PM.',
  },
];

class FoodService {
  private userStatus: Record<string, {
    isInHostel: boolean;
    breakfast: boolean;
    lunch: boolean;
    snacks: boolean;
    dinner: boolean;
    preference: 'veg' | 'non-veg' | 'special';
  }> = {
    'u-student-001': {
      isInHostel: true,
      breakfast: true,
      lunch: true,
      snacks: true,
      dinner: true,
      preference: 'veg',
    },
  };

  private historyLogs: Record<string, FoodAttendanceHistoryItem[]> = {
    'u-student-001': [...INITIAL_HISTORY],
  };

  private dailyMenu: DailyMenuItem[] = [...DEFAULT_MENU];

  async getStudentFoodStatus(studentId: string) {
    const data = this.userStatus[studentId] || {
      isInHostel: true,
      breakfast: true,
      lunch: true,
      snacks: true,
      dinner: true,
      preference: 'veg' as const,
    };
    const history = this.historyLogs[studentId] || INITIAL_HISTORY;
    const lastUpdated = history[0]?.timestamp || new Date().toISOString();

    return {
      ...data,
      lastUpdated,
    };
  }

  async setStudentFoodStatus(studentId: string, isInHostel: boolean): Promise<boolean> {
    return this.setStudentMealAttendance(studentId, {
      isInHostel,
      breakfast: isInHostel,
      lunch: isInHostel,
      snacks: isInHostel,
      dinner: isInHostel,
    });
  }

  async setStudentMealAttendance(
    studentId: string,
    params: {
      isInHostel: boolean;
      breakfast: boolean;
      lunch: boolean;
      snacks: boolean;
      dinner: boolean;
      preference?: 'veg' | 'non-veg' | 'special';
    }
  ): Promise<boolean> {
    this.userStatus[studentId] = {
      isInHostel: params.isInHostel,
      breakfast: params.isInHostel ? params.breakfast : false,
      lunch: params.isInHostel ? params.lunch : false,
      snacks: params.isInHostel ? params.snacks : false,
      dinner: params.isInHostel ? params.dinner : false,
      preference: params.preference || 'veg',
    };

    const mealCodes = [params.breakfast && 'B', params.lunch && 'L', params.snacks && 'S', params.dinner && 'D'].filter(Boolean).join('+');
    const newLog: FoodAttendanceHistoryItem = {
      id: `h-${Date.now()}`,
      student_id: studentId,
      is_in_hostel: params.isInHostel,
      status_label: params.isInHostel
        ? `In Hostel (${mealCodes || 'No meals'})`
        : 'Away on Leave (Meals Cancelled)',
      timestamp: new Date().toISOString(),
      type: params.isInHostel ? 'Active' : 'Changed',
    };

    if (!this.historyLogs[studentId]) {
      this.historyLogs[studentId] = [];
    }
    this.historyLogs[studentId].unshift(newLog);

    return true;
  }

  async getFoodHistory(studentId: string): Promise<FoodAttendanceHistoryItem[]> {
    return this.historyLogs[studentId] || INITIAL_HISTORY;
  }

  async getMessHeadcountSummary(): Promise<MessHeadcountSummary> {
    return {
      totalResidents: 850,
      eatingTodayCount: 782,
      awayCount: 68,
      estimatedFoodReductionKg: 34.5,
      estimatedMoneySaved: 4620,
      breakfastCount: 740,
      lunchCount: 782,
      snacksCount: 690,
      dinnerCount: 755,
      vegCount: 520,
      nonVegCount: 245,
      specialDietCount: 17,
    };
  }

  async getRawMaterialEstimates(headcount: number = 782): Promise<RawMaterialEstimate[]> {
    return [
      { item: 'Rice (Sona Masoori)', unit: 'kg', requiredAmount: Math.round(headcount * 0.12), savingsAmount: Math.round(68 * 0.12), category: 'Grains' },
      { item: 'Wheat Flour (Atta)', unit: 'kg', requiredAmount: Math.round(headcount * 0.08), savingsAmount: Math.round(68 * 0.08), category: 'Grains' },
      { item: 'Toor & Moong Dal', unit: 'kg', requiredAmount: Math.round(headcount * 0.045), savingsAmount: Math.round(68 * 0.045), category: 'Grains' },
      { item: 'Fresh Vegetables & Onions', unit: 'kg', requiredAmount: Math.round(headcount * 0.15), savingsAmount: Math.round(68 * 0.15), category: 'Produce' },
      { item: 'Fresh Milk & Curd', unit: 'liters', requiredAmount: Math.round(headcount * 0.2), savingsAmount: Math.round(68 * 0.2), category: 'Dairy' },
      { item: 'Cooking Oil & Ghee', unit: 'liters', requiredAmount: Math.round(headcount * 0.025), savingsAmount: Math.round(68 * 0.025), category: 'Pantry' },
      { item: 'Paneer (Cottage Cheese)', unit: 'kg', requiredAmount: Math.round(520 * 0.06), savingsAmount: Math.round(40 * 0.06), category: 'Dairy' },
      { item: 'Chicken (Curry Cut)', unit: 'kg', requiredAmount: Math.round(245 * 0.18), savingsAmount: Math.round(28 * 0.18), category: 'Protein' },
    ];
  }

  async getDailyMenu(): Promise<DailyMenuItem[]> {
    return this.dailyMenu;
  }

  async updateDailyMenu(menu: DailyMenuItem[]): Promise<boolean> {
    this.dailyMenu = menu;
    return true;
  }
}

export const foodService = new FoodService();
export default foodService;

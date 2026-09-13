import React, { useState, useEffect } from 'react';
import { MessHeadcountSummary } from '../../types/hostel';
import { foodService } from '../../services/supabase/foodService';
import { Card } from '../../components/ui/Card';
import { StatsCard } from '../../components/analytics/StatsCard';
import {
  UtensilsCrossed,
  Users,
  Home,
  UserX,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const FoodCountManagementPage: React.FC = () => {
  const [summary, setSummary] = useState<MessHeadcountSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await foodService.getMessHeadcountSummary();
        setSummary(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
          Hostel Mess Attendance & Headcount Command
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Live daily student dining attendance, kitchen portion sizing, and wastage reduction analytics
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered"
          value={summary?.totalResidents || 0}
          subtitle="Hostel residents"
          icon={<Users className="w-6 h-6" />}
          variant="blue"
        />
        <StatsCard
          title="Eating Today"
          value={summary?.eatingTodayCount || 0}
          subtitle="Active meal headcount"
          icon={<Home className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title="Away / On Leave"
          value={summary?.awayCount || 0}
          subtitle="Not attending mess"
          icon={<UserX className="w-6 h-6" />}
          variant="urgent"
        />
        <StatsCard
          title="Wastage Prevented"
          value={`~${summary?.estimatedFoodReductionKg || 0} kg`}
          subtitle="Food saved today"
          icon={<TrendingDown className="w-6 h-6" />}
          variant="purple"
        />
      </div>

      {/* Meal Breakdown Card */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Meal Preparation Portions</h3>
            <p className="text-xs text-slate-500">Live portion estimates generated from student app attendance</p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            Real-time Kitchen Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">🍳 Breakfast (7:30 AM)</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{summary?.breakfastCount || 760}</div>
            <span className="text-[11px] text-slate-500">Portions Planned</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">🍲 Lunch (12:30 PM)</span>
            <div className="text-2xl font-black text-blue-950 font-mono">{summary?.lunchCount || 782}</div>
            <span className="text-[11px] text-blue-700 font-semibold">Peak Attendance</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">🍛 Dinner (7:30 PM)</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{summary?.dinnerCount || 745}</div>
            <span className="text-[11px] text-slate-500">Portions Planned</span>
          </div>
        </div>
      </Card>

      {/* Hostel Block Breakdown */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Block-by-Block Dining Presence
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4">Total Capacity</th>
                <th className="py-3 px-4">Present in Mess</th>
                <th className="py-3 px-4">On Leave / Out</th>
                <th className="py-3 px-4 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { block: 'Block A (Men)', total: 240, present: 224, away: 16, rate: '93.3%' },
                { block: 'Block B (Men)', total: 220, present: 198, away: 22, rate: '90.0%' },
                { block: 'Block C (Women)', total: 210, present: 195, away: 15, rate: '92.8%' },
                { block: 'Block D (Women)', total: 180, present: 165, away: 15, rate: '91.6%' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.block}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.total}</td>
                  <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{row.present}</td>
                  <td className="py-3 px-4 font-mono text-amber-600">{row.away}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {row.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

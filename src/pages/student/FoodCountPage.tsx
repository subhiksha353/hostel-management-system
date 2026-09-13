import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { foodService } from '../../services/supabase/foodService';
import { FoodAttendanceHistoryItem } from '../../types/hostel';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  UtensilsCrossed,
  Home,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Info,
  History,
  ShieldCheck,
} from 'lucide-react';
import { formatDateFull, formatDateRelative } from '../../lib/utils';

export const FoodCountPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isInHostel, setIsInHostel] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [history, setHistory] = useState<FoodAttendanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const studentId = user?.id || 'u-student-001';
      const [statusRes, historyRes] = await Promise.all([
        foodService.getStudentFoodStatus(studentId),
        foodService.getFoodHistory(studentId),
      ]);
      setIsInHostel(statusRes.isInHostel);
      setLastUpdated(statusRes.lastUpdated);
      setHistory(historyRes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleTogglePresence = async (status: boolean) => {
    if (status === isInHostel) return;
    setIsUpdating(true);
    try {
      const studentId = user?.id || 'u-student-001';
      await foodService.setStudentFoodStatus(studentId, status);
      setIsInHostel(status);
      setLastUpdated(new Date().toISOString());
      const updatedHistory = await foodService.getFoodHistory(studentId);
      setHistory(updatedHistory);
      showToast(
        status ? 'Food Attendance Count Active' : 'Food Attendance Paused',
        status
          ? 'Mess kitchen will prepare meals for you.'
          : 'Food count stopped to prevent kitchen wastage.',
        'success'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Header matching reference screen */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white p-6 sm:p-7 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Hostel Food Attendance</h1>
            <p className="text-xs text-emerald-100 mt-0.5">
              Mark your status so the mess headcount remains accurate until you leave.
            </p>
          </div>
        </div>
      </div>

      {/* Main Status Toggle Cards */}
      <Card className="p-6 sm:p-7 bg-white border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Your Current Presence Status
        </h3>

        <div className="space-y-3">
          {/* Option 1: In Hostel */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleTogglePresence(true)}
            className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
              isInHostel
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-500/30'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isInHostel ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold">I am in the hostel</h4>
                <p className="text-xs opacity-75 font-medium mt-0.5">
                  (Food count will continue for all meals)
                </p>
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isInHostel
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isInHostel && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>

          {/* Option 2: Not in Hostel */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleTogglePresence(false)}
            className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
              !isInHostel
                ? 'border-amber-600 bg-amber-50/70 text-amber-950 shadow-md ring-2 ring-amber-500/30'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  !isInHostel ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold">I am not in the hostel</h4>
                <p className="text-xs opacity-75 font-medium mt-0.5">
                  (Food count will stop to reduce wastage)
                </p>
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                !isInHostel
                  ? 'border-amber-600 bg-amber-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {!isInHostel && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* Current status info banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 text-slate-700 mt-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Your current status:{' '}
              <strong className={isInHostel ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {isInHostel ? 'I am in the hostel' : 'I am not in the hostel'}
              </strong>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pl-6">
            (Count will remain until you change it)
          </p>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5 pl-6">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last updated: {lastUpdated ? formatDateFull(lastUpdated) : 'Recently'}</span>
          </div>
        </div>
      </Card>

      {/* Food Count History Section matching reference */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            Food Count History Logs
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Real-time sync</span>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    item.is_in_hostel ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {item.is_in_hostel ? <Home className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.status_label}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {formatDateFull(item.timestamp)}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  item.type === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {item.type}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your food count is based on the latest status you have given.</span>
        </div>
      </Card>
    </div>
  );
};

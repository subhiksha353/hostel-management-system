import React, { useState, useEffect } from 'react';
import { Complaint } from '../../types/database';
import { complaintService } from '../../services/supabase/complaintService';
import { useAuth } from '../../hooks/useAuth';
import { ComplaintTable } from '../../components/complaints/ComplaintTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Flame, AlertOctagon, PhoneCall, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyQueue: React.FC = () => {
  const { role } = useAuth();
  const [emergencies, setEmergencies] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEmergencies = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaints({ emergencyOnly: true }, role);
      setEmergencies(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, [role]);

  return (
    <div className="space-y-6">
      {/* Red Header */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
              Priority Red Triage
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">Critical & Emergency Incidents Queue</h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
          High-urgency fire, electrical, infrastructural, or severe medical risks submitted by campus students. Human response required immediately.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full" />
        </div>
      ) : emergencies.length === 0 ? (
        <EmptyState
          title="No Active Emergency Incidents"
          description="All critical emergencies have been addressed. Campus safety status normal."
          icon={<ShieldAlert className="w-8 h-8 text-emerald-600" />}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 px-1">
            <span>🚨 {emergencies.length} Critical Issues Requiring Attention</span>
            <span className="text-slate-500 font-normal">Auto-refreshes periodically</span>
          </div>

          <ComplaintTable complaints={emergencies} baseLink="/management/complaints" />
        </div>
      )}
    </div>
  );
};

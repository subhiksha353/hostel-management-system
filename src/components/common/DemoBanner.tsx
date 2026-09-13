import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/database';
import { ROLE_LABELS } from '../../lib/constants';
import { Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const DemoBanner: React.FC = () => {
  const { role, switchDemoRole, isDemoMode, isGuest } = useAuth();

  if (!isDemoMode && isSupabaseConfigured) return null;

  const roles: UserRole[] = ['student', 'guest_student', 'college_management', 'warden', 'watchman', 'chef', 'department_staff', 'admin', 'super_admin'];

  return (
    <div className="bg-navy-950 text-white border-b border-navy-800 px-4 py-2 text-xs flex flex-col md:flex-row items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-400" /> Demo Persona Switcher
        </span>
        <span className="text-slate-300 text-[11px] hidden lg:inline">
          1-Click Switch: Student, College Management, Warden, Watchman Scanner, Chef & Admin:
        </span>
      </div>

      {/* Role Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 md:pb-0">
        <span className="text-slate-400 text-[10px] font-semibold mr-1 shrink-0 uppercase tracking-wider">Persona:</span>
        {roles.map((r) => {
          const isActive = (r === 'guest_student' && isGuest) || (role === r && !isGuest);
          const conf = ROLE_LABELS[r] || { label: r, badge: '' };

          return (
            <button
              key={r}
              type="button"
              onClick={() => switchDemoRole(r)}
              className={'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap ' + (isActive ? 'bg-blue-600 text-white shadow-sm ring-1 ring-white/20' : 'bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700')}
            >
              {conf.label.split(' ')[0]} {isActive ? '✓' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};

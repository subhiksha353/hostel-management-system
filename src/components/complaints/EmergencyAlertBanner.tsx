import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyAlertBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-4 sm:p-5 shadow-lg shadow-rose-900/20 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
                Emergency Priority Channel
              </span>
              <span className="text-xs text-rose-100">Direct Warden & Safety Alert</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold mt-0.5">Immediate Danger, Fire or Health Concern?</h4>
            <p className="text-xs text-rose-100 max-w-xl mt-1 leading-relaxed">
              If someone is in physical danger or there is an urgent structural/electrical hazard, submit an Emergency Report or call Campus Security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/student/emergency"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-700 font-bold text-xs sm:text-sm hover:bg-rose-50 shadow transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            Report Emergency 🚨
          </Link>
          <a
            href="tel:108"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-800/80 hover:bg-rose-900 text-white font-semibold text-xs border border-white/20 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            Call SOS
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types/database';
import { announcementService } from '../../services/supabase/announcementService';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Megaphone, Calendar, AlertTriangle, Building, Users } from 'lucide-react';
import { formatDateFull, formatDateRelative } from '../../lib/utils';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await announcementService.getAnnouncements();
        setAnnouncements(list);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-purple-600" />
          Campus & Hostel Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official administration notices, maintenance schedules, and safety advisories
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No Active Announcements"
          description="There are currently no broad campus announcements published."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card
              key={a.id}
              className={`p-6 bg-white border space-y-3 transition-all ${
                a.priority === 'urgent'
                  ? 'border-rose-300 bg-rose-50/20 shadow-sm'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {a.department_name || 'Administration'}
                  </span>
                  {a.priority === 'urgent' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Urgent Notice
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {formatDateRelative(a.created_at)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {a.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {a.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Target Audience: <strong className="text-slate-600 capitalize">{a.target_audience}</strong>
                </span>
                <span>Published by: <strong className="text-slate-600">{a.created_by}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

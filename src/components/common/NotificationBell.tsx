import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types/database';
import { notificationService } from '../../services/supabase/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { formatDateRelative } from '../../lib/utils';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, role } = useAuth();

  const loadNotifs = async () => {
    const list = await notificationService.getNotifications(user?.id, role);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 15000);
    return () => clearInterval(interval);
  }, [user, role]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    loadNotifs();
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      loadNotifs();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || '#'}
                    onClick={() => handleItemClick(n)}
                    className={`block p-3.5 hover:bg-slate-50 transition-colors ${
                      !n.is_read ? 'bg-blue-50/40 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-slate-900">{n.title}</h5>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatDateRelative(n.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

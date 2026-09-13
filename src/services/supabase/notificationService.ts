import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { NotificationItem } from '../../types/database';
import { INITIAL_NOTIFICATIONS } from './mockData';

class NotificationService {
  private localNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

  async getNotifications(userId?: string, userRole?: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured) {
      return [...this.localNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    try {
      const query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query.or(`user_id.eq.${userId},user_role.eq.${userRole}`);
      }

      const { data, error } = await query;
      if (error) return this.localNotifications;
      return data || [];
    } catch {
      return this.localNotifications;
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const n = this.localNotifications.find((item) => item.id === notificationId);
      if (n) n.is_read = true;
      return true;
    }

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
      return true;
    } catch {
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    if (!isSupabaseConfigured) {
      this.localNotifications.forEach((n) => (n.is_read = true));
      return true;
    }

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      return true;
    } catch {
      return false;
    }
  }

  async createNotification(item: {
    userId?: string;
    userRole?: string;
    title: string;
    message: string;
    link?: string;
    type: 'complaint' | 'message' | 'status' | 'announcement' | 'emergency';
  }): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: item.userId,
      user_role: item.userRole,
      title: item.title,
      message: item.message,
      link: item.link,
      type: item.type,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      this.localNotifications.unshift(newNotif);
      return newNotif;
    }

    try {
      const { data, error } = await supabase.from('notifications').insert(newNotif).select().single();
      if (error || !data) {
        this.localNotifications.unshift(newNotif);
        return newNotif;
      }
      return data;
    } catch {
      this.localNotifications.unshift(newNotif);
      return newNotif;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

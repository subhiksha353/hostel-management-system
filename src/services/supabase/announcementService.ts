import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Announcement } from '../../types/database';
import { INITIAL_ANNOUNCEMENTS } from './mockData';

class AnnouncementService {
  private localAnnouncements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];

  async getAnnouncements(): Promise<Announcement[]> {
    if (!isSupabaseConfigured) {
      return [...this.localAnnouncements].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`*, department:departments(name)`)
        .order('created_at', { ascending: false });

      if (error) return this.localAnnouncements;
      return (
        data?.map((item: any) => ({
          ...item,
          department_name: item.department?.name,
        })) || []
      );
    } catch {
      return this.localAnnouncements;
    }
  }

  async createAnnouncement(data: {
    title: string;
    content: string;
    departmentId?: string;
    targetAudience: string;
    priority: 'normal' | 'urgent';
    expiresAt?: string;
    createdBy?: string;
  }): Promise<Announcement> {
    const newAnn: Announcement = {
      id: `a-${Date.now()}`,
      title: data.title,
      content: data.content,
      department_id: data.departmentId,
      target_audience: data.targetAudience,
      priority: data.priority,
      expires_at: data.expiresAt,
      created_by: data.createdBy || 'Campus Administration',
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      this.localAnnouncements.unshift(newAnn);
      return newAnn;
    }

    try {
      const { data: created, error } = await supabase
        .from('announcements')
        .insert({
          title: data.title,
          content: data.content,
          department_id: data.departmentId,
          target_audience: data.targetAudience,
          priority: data.priority,
          expires_at: data.expiresAt,
          created_by: data.createdBy || 'Campus Administration',
        })
        .select()
        .single();

      if (error || !created) {
        this.localAnnouncements.unshift(newAnn);
        return newAnn;
      }
      return created;
    } catch {
      this.localAnnouncements.unshift(newAnn);
      return newAnn;
    }
  }
}

export const announcementService = new AnnouncementService();
export default announcementService;

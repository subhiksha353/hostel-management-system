import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ComplaintMessage } from '../../types/database';

class MessageService {
  private localMessages: Record<string, ComplaintMessage[]> = {};

  async getMessages(complaintId: string): Promise<ComplaintMessage[]> {
    if (!isSupabaseConfigured) {
      return this.localMessages[complaintId] || [];
    }

    try {
      const { data, error } = await supabase
        .from('complaint_messages')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (error) {
        return this.localMessages[complaintId] || [];
      }
      return data || [];
    } catch {
      return this.localMessages[complaintId] || [];
    }
  }

  async sendMessage(
    complaintId: string,
    message: string,
    senderRole: string,
    senderDisplayName: string,
    attachments: any[] = []
  ): Promise<ComplaintMessage> {
    const newMsg: ComplaintMessage = {
      id: `msg-${Date.now()}`,
      complaint_id: complaintId,
      sender_role: senderRole,
      sender_display_name: senderDisplayName,
      message,
      attachments,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      if (!this.localMessages[complaintId]) {
        this.localMessages[complaintId] = [];
      }
      this.localMessages[complaintId].push(newMsg);
      return newMsg;
    }

    try {
      const { data, error } = await supabase
        .from('complaint_messages')
        .insert({
          complaint_id: complaintId,
          sender_role: senderRole,
          sender_display_name: senderDisplayName,
          message,
          attachments,
        })
        .select()
        .single();

      if (error || !data) {
        if (!this.localMessages[complaintId]) this.localMessages[complaintId] = [];
        this.localMessages[complaintId].push(newMsg);
        return newMsg;
      }
      return data;
    } catch {
      if (!this.localMessages[complaintId]) this.localMessages[complaintId] = [];
      this.localMessages[complaintId].push(newMsg);
      return newMsg;
    }
  }

  subscribeToMessages(complaintId: string, callback: (msg: ComplaintMessage) => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel(`complaint-messages-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_messages',
          filter: `complaint_id=eq.${complaintId}`,
        },
        (payload) => {
          callback(payload.new as ComplaintMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const messageService = new MessageService();
export default messageService;

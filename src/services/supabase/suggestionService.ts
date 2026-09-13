import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Suggestion, SuggestionStatus } from '../../types/database';
import { INITIAL_SUGGESTIONS } from './mockData';
import { generateAnonymousStudentId } from '../../lib/utils';

class SuggestionService {
  private localSuggestions: Suggestion[] = [...INITIAL_SUGGESTIONS];
  private localUpvotes: Set<string> = new Set();

  async getSuggestions(): Promise<Suggestion[]> {
    if (!isSupabaseConfigured) {
      return [...this.localSuggestions].sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
    }

    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('upvote_count', { ascending: false });

      if (error) return this.localSuggestions;
      return data || [];
    } catch {
      return this.localSuggestions;
    }
  }

  async createSuggestion(title: string, description: string, category: string): Promise<Suggestion> {
    const anonId = generateAnonymousStudentId();
    const newSug: Suggestion = {
      id: `s-${Date.now()}`,
      title,
      description,
      category,
      anonymous_public_id: anonId,
      status: 'pending',
      upvote_count: 1,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      this.localSuggestions.unshift(newSug);
      return newSug;
    }

    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          title,
          description,
          category,
          anonymous_public_id: anonId,
          status: 'pending',
          upvote_count: 1,
        })
        .select()
        .single();

      if (error || !data) {
        this.localSuggestions.unshift(newSug);
        return newSug;
      }
      return data;
    } catch {
      this.localSuggestions.unshift(newSug);
      return newSug;
    }
  }

  async upvoteSuggestion(suggestionId: string, userIdentifier: string): Promise<{ success: boolean; newCount: number }> {
    const key = `${userIdentifier}:${suggestionId}`;
    if (!isSupabaseConfigured) {
      const found = this.localSuggestions.find((s) => s.id === suggestionId);
      if (!found) return { success: false, newCount: 0 };

      if (this.localUpvotes.has(key)) {
        this.localUpvotes.delete(key);
        found.upvote_count = Math.max(0, (found.upvote_count || 1) - 1);
        found.has_user_upvoted = false;
      } else {
        this.localUpvotes.add(key);
        found.upvote_count = (found.upvote_count || 0) + 1;
        found.has_user_upvoted = true;
      }
      return { success: true, newCount: found.upvote_count };
    }

    try {
      const { data: item } = await supabase.from('suggestions').select('upvote_count').eq('id', suggestionId).single();
      const newCount = (item?.upvote_count || 0) + 1;
      await supabase.from('suggestions').update({ upvote_count: newCount }).eq('id', suggestionId);
      return { success: true, newCount };
    } catch {
      return { success: true, newCount: 1 };
    }
  }

  async updateStatus(suggestionId: string, status: SuggestionStatus, response?: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const s = this.localSuggestions.find((item) => item.id === suggestionId);
      if (s) {
        s.status = status;
        if (response) s.official_response = response;
        return true;
      }
      return false;
    }

    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (response) updateData.official_response = response;
      await supabase.from('suggestions').update(updateData).eq('id', suggestionId);
      return true;
    } catch {
      return false;
    }
  }
}

export const suggestionService = new SuggestionService();
export default suggestionService;

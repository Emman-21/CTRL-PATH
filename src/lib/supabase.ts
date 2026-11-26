import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithSupabaseGoogle(redirectTo?: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/login`,
      queryParams: {
        prompt: 'select_account',
        hd: 'g.batstate-u.edu.ph',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutFromSupabase() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Supabase sign-out error:', error.message);
}

export async function signUpWithSupabaseEmail(params: {
  email: string;
  password: string;
  displayName: string;
  program?: string;
  yearLevel?: string;
  section?: string;
}) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        full_name: params.displayName.trim(),
        program: params.program?.trim() || '',
        year_level: params.yearLevel?.trim() || '',
        section: params.section?.trim() || '',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithSupabaseEmail(email: string, password: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function sendSupabasePasswordReset(email: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}

export async function updateSupabasePassword(newPassword: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

export async function uploadStudentAvatar(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image must be 2MB or smaller.');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Please sign in to upload a profile picture.');
  }

  const filePath = `${user.id}/profile-photo`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function removeStudentAvatar(): Promise<void> {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.storage.from('avatars').remove([`${user.id}/profile-photo`]);
}

// ==========================================
// 1. AI CHAT HISTORY HELPERS
// ==========================================
export interface AiChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  track_context?: string | null;
  created_at: string;
}

export async function fetchAiMessages(): Promise<AiChatMessageRow[]> {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, track_context, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error || !data) return [];
  return data as AiChatMessageRow[];
}

export async function saveAiMessage(params: {
  role: 'user' | 'assistant';
  content: string;
  trackContext?: string;
}) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      user_id: user.id,
      role: params.role,
      content: params.content,
      track_context: params.trackContext || null,
    })
    .select('id, role, content, track_context, created_at')
    .single();

  if (error) throw error;
  return data as AiChatMessageRow;
}

export async function clearAiMessages(): Promise<void> {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('ai_messages').delete().eq('user_id', user.id);
}

// ==========================================
// 2. FEEDBACK / BUG REPORT HELPER
// ==========================================
export async function submitStudentFeedback(params: {
  category: 'bug' | 'suggestion' | 'content' | 'other';
  message: string;
  pageRoute?: string;
}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const cleanMessage = params.message.trim();
  if (cleanMessage.length < 5) {
    throw new Error('Please enter at least 5 characters.');
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id ?? null,
    student_email: user?.email ?? null,
    category: params.category,
    message: cleanMessage.slice(0, 2000),
    page_route: params.pageRoute || window.location.pathname,
  });

  if (error) throw error;
}

// ==========================================
// 3. TRACK ANALYTICS HELPERS
// ==========================================
export interface CicsTrackSummary {
  total_students: number;
  recommended_counts: { NT: number; BA: number; SM: number };
  chosen_counts: { NT: number; BA: number; SM: number };
  avg_progress: { NT: number; BA: number; SM: number };
}

export async function upsertStudentAnalytics(params: {
  recommendedTrack?: 'NT' | 'BA' | 'SM' | null;
  chosenTrack?: 'NT' | 'BA' | 'SM' | null;
  ntProgress: number;
  baProgress: number;
  smProgress: number;
  quizAttemptsCount: number;
}) {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[Analytics] Skipped sync: no authenticated Supabase user.');
    return;
  }

  const { error } = await supabase.from('track_analytics').upsert({
    user_id: user.id,
    recommended_track: params.recommendedTrack ?? null,
    chosen_track: params.chosenTrack ?? null,
    nt_progress: Math.round(params.ntProgress),
    ba_progress: Math.round(params.baProgress),
    sm_progress: Math.round(params.smProgress),
    quiz_attempts_count: params.quizAttemptsCount,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Analytics] Failed to upsert track_analytics:', error.message);
  }
}

export async function fetchCicsTrackSummary(): Promise<CicsTrackSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_cics_track_summary');
  if (error || !data) return null;
  return data as CicsTrackSummary;
}

// ==========================================
// 4. ADMIN ANALYTICS VERIFICATION & FETCH
// ==========================================
export interface AdminFeedbackItem {
  id: string;
  student_email: string | null;
  category: 'bug' | 'suggestion' | 'content' | 'other';
  message: string;
  page_route: string | null;
  status: 'open' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface AdminDailyActivityPoint {
  day: string;
  iso_date: string;
  active_count: number;
}

export interface AdminAnalyticsPayload {
  summary: {
    total_students: number;
    total_quiz_attempts: number;
    undecided_students: number;
    recommended_counts: { NT: number; BA: number; SM: number };
    chosen_counts: { NT: number; BA: number; SM: number };
    avg_progress: { NT: number; BA: number; SM: number };
  };
  daily_activity: AdminDailyActivityPoint[];
  feedback: AdminFeedbackItem[];
}

export async function verifyAdminAndFetchAnalytics(
  passcode: string,
): Promise<AdminAnalyticsPayload> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.rpc('verify_admin_and_get_analytics', {
    admin_passcode: passcode.trim(),
  });
  if (error) {
    throw new Error(error.message || 'Invalid administrator passcode.');
  }
  return data as AdminAnalyticsPayload;
}
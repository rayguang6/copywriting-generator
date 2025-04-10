import { User } from '@supabase/supabase-js';

export interface BusinessProfile {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string; // Business name
  industry: string | null;
  target_audience: string | null;
  unique_value_proposition: string | null;
  pain_points: string | null;
  brand_voice: string | null;
  is_default: boolean;
}

export interface CopywritingHistory {
  id: string; // UUID
  created_at: string;
  user_id: string;
  business_profile_id: string | null;
  prompt: string;
  result: string;
}

export interface Chat {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  framework: string;
  business_profile_id: string | null;
  is_archived: boolean;
}

export interface Message {
  id: string; // UUID
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Legacy enum - kept for backward compatibility but should use framework IDs ('aida', 'fab', 'pas') instead
export enum CopywritingFramework {
  AIDA = 'AIDA (Attention, Interest, Desire, Action)',
  FAB = 'FAB (Features, Advantages, Benefits)',
  PAS = 'PAS (Problem, Agitate, Solution)'
} 
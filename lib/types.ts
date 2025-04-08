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
  framework: string;
  prompt: string;
  result: string;
}

export enum CopywritingFramework {
  AIDA = 'AIDA (Attention, Interest, Desire, Action)',
  PAS = 'PAS (Problem, Agitate, Solution)',
  BAB = 'BAB (Before, After, Bridge)',
  FOUR_PS = 'The 4 Ps (Promise, Picture, Proof, Push)',
  ACCA = 'ACCA (Awareness, Comprehension, Conviction, Action)',
  FAB = 'FAB (Features, Advantages, Benefits)'
} 
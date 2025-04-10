import { supabase } from './supabase';
import { BusinessProfile } from './types';
import { getCurrentUser } from './user-service';

/**
 * Fetch all business profiles for the current user
 */
export async function getUserBusinessProfiles(): Promise<BusinessProfile[]> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching business profiles:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch a specific business profile by ID
 */
export async function getBusinessProfileById(id: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching business profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Fetch the default business profile for the current user
 */
export async function getDefaultBusinessProfile(): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('is_default', true)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "Results contain 0 rows"
    console.error('Error fetching default business profile:', error);
    throw error;
  }
  
  return data || null;
}

/**
 * Create a new business profile
 */
export async function createBusinessProfile(profile: Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<BusinessProfile> {
  // Get the current user to get their ID
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    throw new Error('You must be logged in to create a business profile');
  }
  
  // Get all existing profiles to determine if this is the first one (which should be default)
  const existingProfiles = await getUserBusinessProfiles();
  const isDefault = existingProfiles.length === 0 ? true : profile.is_default;
  
  // If this profile is being set as default, we need to unset any other defaults
  if (isDefault) {
    await unsetDefaultProfiles();
  }
  
  const { data, error } = await supabase
    .from('business_profiles')
    .insert({
      ...profile,
      user_id: currentUser.id,
      is_default: isDefault
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating business profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update an existing business profile
 */
export async function updateBusinessProfile(id: string, profile: Partial<Omit<BusinessProfile, 'id' | 'created_at' | 'user_id'>>): Promise<BusinessProfile> {
  // If this profile is being set as default, we need to unset any other defaults
  if (profile.is_default) {
    await unsetDefaultProfiles();
  }
  
  const { data, error } = await supabase
    .from('business_profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating business profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Delete a business profile by ID
 */
export async function deleteBusinessProfile(id: string): Promise<void> {
  // Check if this is the default profile
  const profileToDelete = await getBusinessProfileById(id);
  
  const { error } = await supabase
    .from('business_profiles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting business profile:', error);
    throw error;
  }
  
  // If we deleted the default profile, set a new default if other profiles exist
  if (profileToDelete?.is_default) {
    const remainingProfiles = await getUserBusinessProfiles();
    if (remainingProfiles.length > 0) {
      await updateBusinessProfile(remainingProfiles[0].id, { is_default: true });
    }
  }
}

/**
 * Set a specific business profile as the default
 */
export async function setDefaultBusinessProfile(id: string): Promise<void> {
  // First, unset all default profiles
  await unsetDefaultProfiles();
  
  // Then set the new default
  const { error } = await supabase
    .from('business_profiles')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error setting default business profile:', error);
    throw error;
  }
}

/**
 * Private helper to unset all default profiles
 */
async function unsetDefaultProfiles(): Promise<void> {
  const { error } = await supabase
    .from('business_profiles')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('is_default', true);
  
  if (error) {
    console.error('Error unsetting default business profiles:', error);
    throw error;
  }
} 
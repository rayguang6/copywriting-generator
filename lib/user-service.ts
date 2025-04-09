import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * Ensure that a user exists in the public users table
 * This function checks if the user exists and creates them if not
 */
export async function ensureUserExists(user: User): Promise<void> {
  if (!user || !user.id) {
    throw new Error('Invalid user provided');
  }

  try {
    // First check if the user exists in the public users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (checkError || !existingUser) {
      // User doesn't exist in the public table, let's insert them
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating user in public table:', insertError);
        throw new Error('Failed to create user record. Please try again or contact support.');
      }
    }
  } catch (error) {
    console.error('Error checking/creating user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
  
  return data;
} 
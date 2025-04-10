import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
 * Get the current authenticated user from the users table
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  // First check if the user is authenticated with Supabase
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
    return null;
  }
  
  if (!sessionData.session || !sessionData.session.user) {
    return null; // No authenticated user
  }
  
  try {
    // Now get the user record from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching current user:', error);
      
      // If user doesn't exist in users table yet, create them
      if (error.code === 'PGRST116') { // No rows returned
        const authUser = sessionData.session.user;
        
        try {
          await ensureUserExists(authUser);
          
          // Try fetching again
          const { data: newUserData, error: newUserError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (newUserError) {
            console.error('Error fetching newly created user:', newUserError);
            return null;
          }
          
          return newUserData;
        } catch (createError) {
          console.error('Error creating user during getCurrentUser:', createError);
          return null;
        }
      }
      
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AppUser | null> {
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
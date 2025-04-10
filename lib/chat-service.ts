import { supabase } from './supabase';
import { BusinessProfile } from './types';
import { getCurrentUser } from './user-service';

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  framework: string;
  business_profile_id: string | null;
  created_at: string;
  archived: boolean;
  business_profile?: BusinessProfile;
  messages?: Message[];
}

/**
 * Get all chats for the current user
 */
export async function getUserChats(): Promise<Chat[]> {
  // Get the current user
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('You must be logged in to view chats');
  }

  // Get user's chats
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      business_profile:business_profile_id (
        id, 
        name, 
        industry, 
        target_audience, 
        unique_value_proposition,
        pain_points,
        brand_voice
      )
    `)
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting chats:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a chat by id, including messages
 */
export async function getChatById(id: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      business_profile:business_profile_id (
        id, 
        name, 
        industry, 
        target_audience, 
        unique_value_proposition,
        pain_points,
        brand_voice
      ),
      messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting chat:', error);
    throw error;
  }

  // Sort messages by created_at
  if (data && data.messages) {
    data.messages.sort((a: Message, b: Message) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return data;
}

/**
 * Create a new chat
 */
export async function createChat(
  title: string,
  framework: string,
  businessProfileId: string | null
): Promise<Chat> {
  // Get the current user
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    console.error('Create chat failed: User not authenticated');
    throw new Error('You must be logged in to create a chat');
  }

  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        title,
        framework,
        business_profile_id: businessProfileId,
        user_id: currentUser.id,
        archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error.message, error.details, error.hint);
      throw error;
    }

    if (!data) {
      console.error('Create chat failed: No data returned from database');
      throw new Error('No data returned when creating chat');
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in createChat:', error);
    throw new Error('Failed to create new chat. Please try again.');
  }
}

/**
 * Update a chat
 */
export async function updateChat(
  id: string,
  updates: Partial<Omit<Chat, 'id' | 'created_at' | 'user_id'>>
): Promise<Chat> {
  const { data, error } = await supabase
    .from('chats')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat:', error);
    throw error;
  }

  return data;
}

/**
 * Archive a chat
 */
export async function archiveChat(id: string): Promise<void> {
  const { error } = await supabase
    .from('chats')
    .update({ archived: true })
    .eq('id', id);

  if (error) {
    console.error('Error archiving chat:', error);
    throw error;
  }
}

/**
 * Delete a chat and its messages
 */
export async function deleteChat(id: string): Promise<void> {
  const { error: deleteMessagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', id);

  if (deleteMessagesError) {
    console.error('Error deleting messages:', deleteMessagesError);
    throw deleteMessagesError;
  }

  const { error: deleteChatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', id);

  if (deleteChatError) {
    console.error('Error deleting chat:', deleteChatError);
    throw deleteChatError;
  }
}

/**
 * Add a message to a chat
 */
export async function addMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  // Verify the current user has access to this chat
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('You must be logged in to add a message');
  }
  
  // Verify this chat belongs to the current user
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('id')
    .eq('id', chatId)
    .eq('user_id', currentUser.id)
    .single();
    
  if (chatError || !chatData) {
    console.error('Error verifying chat ownership:', chatError);
    throw new Error('You do not have permission to add messages to this chat');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }

  return data;
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at');

  if (error) {
    console.error('Error getting messages:', error);
    throw error;
  }

  return data || [];
} 
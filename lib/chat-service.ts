import { supabase } from './supabase';
import { Chat, Message, CopywritingFramework } from './types';

/**
 * Fetch all chats for the current user
 */
export async function getUserChats(): Promise<Chat[]> {
  // Get the current user from the session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    console.warn('No authenticated user found when fetching chats');
    return [];
  }
  
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch a specific chat by ID, including its messages
 */
export async function getChatById(id: string): Promise<{ chat: Chat, messages: Message[] }> {
  // Get the chat
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .single();
  
  if (chatError) {
    console.error('Error fetching chat:', chatError);
    throw chatError;
  }
  
  // Get the messages for this chat
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });
  
  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    throw messagesError;
  }
  
  return {
    chat,
    messages: messages || []
  };
}

/**
 * Create a new chat
 */
export async function createChat(
  title: string,
  framework: CopywritingFramework | undefined,
  businessProfileId: string | null = null
): Promise<Chat> {
  // Get the current user from the session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated. Please sign in to create a chat.');
  }

  // Ensure the user exists in the public users table
  try {
    // First check if the user exists in the public users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (checkError || !existingUser) {
      // User doesn't exist in the public table, let's insert them
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: session.user.email,
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
  
  // Use a default framework if none is provided
  const chatFramework = framework || CopywritingFramework.AIDA;
  
  const { data, error } = await supabase
    .from('chats')
    .insert({
      title,
      framework: chatFramework,
      business_profile_id: businessProfileId,
      is_archived: false,
      user_id: userId // Explicitly set the user_id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update a chat (e.g., title, archived status)
 */
export async function updateChat(id: string, updates: Partial<Omit<Chat, 'id' | 'created_at' | 'user_id'>>): Promise<Chat> {
  const { data, error } = await supabase
    .from('chats')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
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
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error archiving chat:', error);
    throw error;
  }
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(id: string): Promise<void> {
  // First delete all messages in this chat
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', id);
  
  if (messagesError) {
    console.error('Error deleting chat messages:', messagesError);
    throw messagesError;
  }
  
  // Then delete the chat itself
  const { error: chatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', id);
  
  if (chatError) {
    console.error('Error deleting chat:', chatError);
    throw chatError;
  }
}

/**
 * Add a new message to a chat
 */
export async function addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
  // Verify the chat exists and belongs to the current user
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated. Please sign in to add messages.');
  }
  
  try {
    // Verify the chat belongs to the current user
    const { data: chatData, error: chatCheckError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();
      
    if (chatCheckError) {
      console.error('Error verifying chat ownership:', chatCheckError);
      
      if (chatCheckError.code === 'PGRST116') {
        throw new Error('Chat not found. It may have been deleted.');
      }
      
      throw new Error('You do not have permission to add messages to this chat.');
    }
    
    // Add the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role,
        content
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error adding message:', messageError);
      throw messageError;
    }
    
    // Update the chat's updated_at timestamp
    const { error: chatError } = await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);
    
    if (chatError) {
      console.error('Error updating chat timestamp:', chatError);
      // Non-critical error, don't throw
    }
    
    return message;
  } catch (error) {
    console.error('Error in addMessage:', error);
    throw error;
  }
}

/**
 * Get all messages for a specific chat
 */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  return data || [];
} 
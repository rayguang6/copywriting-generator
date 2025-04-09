-- Set default value for framework column
ALTER TABLE chats 
ALTER COLUMN framework SET DEFAULT 'AIDA (Attention, Interest, Desire, Action)';

-- Fix any existing null values
UPDATE chats 
SET framework = 'AIDA (Attention, Interest, Desire, Action)'
WHERE framework IS NULL;

-- Make sure all required indexes are created
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats (user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_is_default ON business_profiles (is_default) WHERE is_default = true; 
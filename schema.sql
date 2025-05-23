-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT
);

-- Create business_profiles table for multiple business profiles per user
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  target_audience TEXT,
  unique_value_proposition TEXT,
  pain_points TEXT,
  brand_voice TEXT,
  is_default BOOLEAN DEFAULT FALSE
);

-- Create copywriting_history table
CREATE TABLE IF NOT EXISTS copywriting_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_profile_id UUID REFERENCES business_profiles,
  framework TEXT NOT NULL,
  prompt TEXT NOT NULL,
  result TEXT NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE copywriting_history ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only read their own profile
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Business Profiles policies
-- Users can read their own business profiles
CREATE POLICY "Users can read own business profiles" 
  ON business_profiles FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own business profiles
CREATE POLICY "Users can insert own business profiles" 
  ON business_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own business profiles
CREATE POLICY "Users can update own business profiles" 
  ON business_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own business profiles
CREATE POLICY "Users can delete own business profiles" 
  ON business_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can read their own copywriting history
CREATE POLICY "Users can read own copywriting history" 
  ON copywriting_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert into their own copywriting history
CREATE POLICY "Users can insert into own copywriting history" 
  ON copywriting_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 
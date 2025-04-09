# Supabase Setup for Copywriting Generator

This guide will help you set up your Supabase project correctly for the Copywriting Generator application.

## Creating the Tables

You have two options to create the required database tables:

### Option 1: Using the SQL Editor in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy the contents of the `supabase/migrations/copywriting-tables.sql` file
6. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push
```

## Fixing the Framework Column

If you encounter the error "null value in column framework of relation chats violates not-null constraint", run the SQL in the `supabase/migrations/fix-framework-column.sql` file:

```sql
-- Set default value for framework column
ALTER TABLE chats 
ALTER COLUMN framework SET DEFAULT 'AIDA (Attention, Interest, Desire, Action)';

-- Fix any existing null values
UPDATE chats 
SET framework = 'AIDA (Attention, Interest, Desire, Action)'
WHERE framework IS NULL;
```

## Fixing Foreign Key Constraint Issues

If you encounter the error "insert or update on table chats violates foreign key constraint chats_user_id_fkey", you need to ensure that users exist in the public users table. Run the SQL in the `supabase/migrations/create-public-users-table.sql` file:

```sql
-- Create a public users table that mirrors auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically insert new users from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert existing auth users into the public users table
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

## Verifying RLS Policies

After creating the tables, verify that Row Level Security (RLS) policies are correctly set up:

1. Go to your Supabase dashboard
2. Navigate to the Auth > Policies section
3. You should see policies for each table:
   - `business_profiles`
   - `chats`
   - `messages`

Ensure that each table has policies for SELECT, INSERT, UPDATE, and DELETE operations.

## Environment Variables

Make sure your application has the correct environment variables set up:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

## Troubleshooting RLS Issues

If you're experiencing "failed RLS policy" errors:

1. **Check Authentication**: Ensure your user is properly authenticated
2. **Verify Table Structure**: Confirm that your tables have the correct columns, especially `user_id`
3. **Check Policies**: Ensure your RLS policies are correctly defined
4. **Test with Supabase UI**: Try manually inserting rows through the Supabase Table Editor to verify permissions

## Common Issues and Solutions

### Error: "insert or update on table chats violates foreign key constraint chats_user_id_fkey"

This happens when trying to create a chat with a user_id that doesn't exist in the `auth.users` table.

**Solution**:
1. Run the SQL in `supabase/migrations/create-public-users-table.sql` to create a public users table
2. Ensure the authenticated user exists in the public table before creating chats
3. Check that your authentication flow is working correctly

### Error: "null value in column framework of relation chats violates not-null constraint"

This happens when trying to create a chat without specifying a framework.

**Solution**: 
1. Run the SQL fix in the `supabase/migrations/fix-framework-column.sql` file
2. Make sure your code provides a default framework when none is selected

### Error: "new row violates row-level security policy for table"

This usually means:
1. The user is not authenticated
2. The user_id is not being set correctly when inserting rows
3. The RLS policy is not configured correctly

**Solution**: Ensure your service functions are explicitly setting the user_id when creating rows, and verify the user is authenticated before making database operations.

### Error: "JSON object requested, multiple (or no) rows returned"

This happens when using `.single()` on a query that returns no rows or multiple rows.

**Solution**: Handle cases where the query might not return exactly one row, or use appropriate filters to ensure only one row is returned.

### Debugging Tips

To debug Supabase issues:
1. Use the Network tab in your browser's developer tools to inspect API calls
2. Look at the request and response payloads
3. Check the Supabase logs in your project dashboard
4. Test queries directly in the Supabase SQL Editor to verify they work as expected 
#!/bin/bash

# This script helps create the database tables in Supabase

echo "Setting up database tables in Supabase..."
echo "Please visit your Supabase dashboard and execute the SQL in schema.sql"
echo "Follow these steps:"
echo "1. Go to https://supabase.com/dashboard and log in"
echo "2. Select your project (with URL: $NEXT_PUBLIC_SUPABASE_URL)"
echo "3. Navigate to SQL Editor"
echo "4. Create a new query"
echo "5. Copy the contents of schema.sql and paste them into the query editor"
echo "6. Click Run to execute the SQL"
echo ""
echo "After executing the schema.sql, your database tables will be set up properly."
echo "You can then use the business profiles feature in the app."

# Copy schema.sql to clipboard if possible
if command -v pbcopy > /dev/null; then
  # macOS
  cat schema.sql | pbcopy
  echo "The SQL has been copied to your clipboard (macOS)."
elif command -v xclip > /dev/null; then
  # Linux with X11
  cat schema.sql | xclip -selection clipboard
  echo "The SQL has been copied to your clipboard (Linux with xclip)."
elif command -v clip > /dev/null; then
  # Windows
  cat schema.sql | clip
  echo "The SQL has been copied to your clipboard (Windows)."
else
  echo "Unable to copy to clipboard automatically. Please manually copy the SQL from schema.sql."
fi

echo ""
echo "After tables are created, run 'npm run dev' to start the application." 
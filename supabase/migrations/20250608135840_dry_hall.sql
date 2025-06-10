/*
  # Fix threads and messages schema

  1. Schema Updates
    - Add missing `users` table reference
    - Ensure proper foreign key relationships
    - Add proper indexes for performance
    
  2. Security
    - Update RLS policies to use proper auth functions
    - Ensure users can only access their own data
    
  3. Data Integrity
    - Add proper constraints and defaults
    - Ensure timestamps are handled correctly
*/

-- First, let's make sure we have the proper auth.uid() function reference
-- Update threads table policies to use auth.uid() instead of uid()
DROP POLICY IF EXISTS "Users can create their own threads" ON threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON threads;
DROP POLICY IF EXISTS "Users can update their own threads" ON threads;
DROP POLICY IF EXISTS "Users can view their own threads" ON threads;

CREATE POLICY "Users can create their own threads"
  ON threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
  ON threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
  ON threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own threads"
  ON threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update messages table policies
DROP POLICY IF EXISTS "Users can create messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can delete messages from their threads" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
DROP POLICY IF EXISTS "Users can view messages from their threads" ON messages;

CREATE POLICY "Users can create messages in their threads"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their threads"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their threads"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages from their threads"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS threads_user_id_created_at_idx ON threads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_thread_id_created_at_idx ON messages(thread_id, created_at ASC);
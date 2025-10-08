-- Fix RLS Policy for account_history table
-- This migration fixes the overly restrictive RLS policy that was blocking inserts

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users cannot insert account history" ON account_history;

-- Create a new policy that allows authenticated users to insert their own records
CREATE POLICY "Users can insert own account history" ON account_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT INSERT ON account_history TO authenticated;
GRANT SELECT ON account_history TO authenticated;

-- Also ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION log_account_activity TO authenticated;

/*
  # Fix Reviews RLS Policy

  Allow unauthenticated users to read reviews.
  This is needed for public viewing of attraction reviews.
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;

-- Create new policy allowing both authenticated and unauthenticated users to read
CREATE POLICY "Anyone can read reviews" ON reviews 
  FOR SELECT 
  USING (true);

-- Keep the authenticated-only policies for write operations
-- (already exist: "Authenticated insert reviews", "Owner update reviews", "Owner or admin delete reviews")

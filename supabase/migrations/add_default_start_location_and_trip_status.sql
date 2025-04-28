/*
  # Add default_start_location to vehicles and status to trips

  1. Modified Tables
    - `vehicles`
      - Add `defaultStartLocation` (text, nullable)
    - `trips`
      - Add `status` (text, not null, default 'complete')
  2. Security
    - Update RLS policies for `vehicles` to include `defaultStartLocation`
    - Add RLS policies for `trips` to include `status`
*/

-- Add defaultStartLocation to vehicles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'defaultStartLocation'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN "defaultStartLocation" text;
  END IF;
END $$;

-- Add status to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'status'
  ) THEN
    ALTER TABLE trips ADD COLUMN status text NOT NULL DEFAULT 'complete';
  END IF;
END $$;

-- Update RLS policies for vehicles to include the new column
-- Policies already allow authenticated users to read/insert/update/delete their own vehicles.
-- The new column is automatically covered by these existing policies as long as it's part of the row.
-- No explicit policy modification needed for the new column itself, but good to review.
-- The existing policies are sufficient:
-- "Authenticated users can read their own vehicles" USING (auth.uid() = user_id);
-- "Authenticated users can insert their own vehicles" WITH CHECK (auth.uid() = user_id);
-- "Authenticated users can update their own vehicles" USING (auth.uid() = user_id);
-- "Authenticated users can delete their own vehicles" USING (auth.uid() = user_id);

-- Update RLS policies for trips to include the new column
-- Policies already allow authenticated users to read/insert/update/delete their own trips.
-- The new column is automatically covered by these existing policies as long as it's part of the row.
-- No explicit policy modification needed for the new column itself, but good to review.
-- The existing policies are sufficient:
-- "Authenticated users can read their own trips" USING (auth.uid() = user_id);
-- "Authenticated users can insert their own trips" WITH CHECK (auth.uid() = user_id);
-- "Authenticated users can update their own trips" USING (auth.uid() = user_id);
-- "Authenticated users can delete their own trips" USING (auth.uid() = user_id);

/*
  # Create trips table

  1. New Tables
    - `trips`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to auth.users, not null)
      - `vehicleId` (uuid, foreign key to vehicles, not null)
      - `date` (date, not null)
      - `startTime` (time, not null)
      - `endTime` (time, not null)
      - `startLocation` (text, not null)
      - `endLocation` (text, not null)
      - `purpose` (text, not null) - Consider using an ENUM type in the future
      - `startOdometer` (integer, not null)
      - `endOdometer` (integer, not null)
      - `driverName` (text, not null)
      - `notes` (text)
      - `created_at` (timestamptz, default now(), not null)
  2. Security
    - Enable RLS on `trips` table
    - Add policy for authenticated users to read their own trips
    - Add policy for authenticated users to insert their own trips
    - Add policy for authenticated users to update their own trips
    - Add policy for authenticated users to delete their own trips
*/

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "vehicleId" uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  "startTime" time NOT NULL,
  "endTime" time NOT NULL,
  "startLocation" text NOT NULL,
  "endLocation" text NOT NULL,
  purpose text NOT NULL, -- Consider using an ENUM type in the future
  "startOdometer" integer NOT NULL,
  "endOdometer" integer NOT NULL,
  "driverName" text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read their own trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own trips"
  ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own trips"
  ON trips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own trips"
  ON trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

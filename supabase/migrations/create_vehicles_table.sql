/*
  # Create vehicles table

  1. New Tables
    - `vehicles`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to auth.users, not null)
      - `licensePlate` (text, unique, not null)
      - `make` (text, not null)
      - `model` (text, not null)
      - `year` (integer, not null)
      - `initialOdometer` (integer, default 0, not null)
      - `currentOdometer` (integer, default 0, not null)
      - `created_at` (timestamptz, default now(), not null)
  2. Security
    - Enable RLS on `vehicles` table
    - Add policy for authenticated users to read their own vehicles
    - Add policy for authenticated users to insert their own vehicles
    - Add policy for authenticated users to update their own vehicles
    - Add policy for authenticated users to delete their own vehicles
*/

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "licensePlate" text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  "initialOdometer" integer DEFAULT 0 NOT NULL,
  "currentOdometer" integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read their own vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own vehicles"
  ON vehicles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
